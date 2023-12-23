import { scriptWrapper } from "./wrapper";
import { ethers } from "ethers";
import * as LPTokenContract from "./BTCLPToken.json";
import util from "node:util";
import nodeChildProcess from "node:child_process";
import { WADToAmount } from "./common";

const exec = util.promisify(nodeChildProcess.exec);
const SCRIPT_INTERVAL = 30000;

const TOKEN_SALE_PRICE = 1; // change this to adjust yield. Starts as 1:1

const runScript = scriptWrapper(async ({ ethProvider, db }) => {
  const lpTokenContract = new ethers.Contract(
    process.env.BTC_LP_TOKEN_CONTRACT_ADDRESS as string,
    LPTokenContract.abi,
    ethProvider
  );
  const recentRemovals = await lpTokenContract.queryFilter(
    lpTokenContract.filters.LiquidityRemoved(),
    -100,
    -2
  );

  const feeCheck = await exec(
    `${process.env.BITCOIN_CLI_PREFIX} estimatesmartfee 1`
  );

  for (const removalTx of recentRemovals) {
    const payedOutRecord = await db.query(
      `SELECT * FROM lp_payouts WHERE currency='BTC' AND burn_txid=$1`,
      [removalTx.transactionHash]
    );
    if (payedOutRecord.rowCount > 0) {
      continue;
    }
    const amount = removalTx.args?.amount?.toString();
    const burnedAmount = Number(WADToAmount(amount));
    const withdrawalAddress = removalTx.args?.withdrawalAddress;

    const networkFee = JSON.parse(feeCheck.stdout).feerate / 3; // Estimated 333 vB
    const balanceCheck = await exec(
      `${process.env.BITCOIN_CLI_PREFIX} getwalletinfo`
    );
    const walletInfo = JSON.parse(balanceCheck.stdout);

    const outgoingBtcAmount = burnedAmount * TOKEN_SALE_PRICE;

    if (walletInfo.balance < Number(outgoingBtcAmount)) {
      console.log("BTC liquidity is empty");
      continue;
    }

    await db.query(
      "INSERT INTO lp_payouts (burn_txid, currency) VALUES ($1, $2)",
      [removalTx.transactionHash, "BTC"]
    );

    try {
      const sendAmount = (outgoingBtcAmount - networkFee).toFixed(8);
      const btcPayment = await exec(
        `${process.env.BITCOIN_CLI_PREFIX} -named sendtoaddress address=${withdrawalAddress} amount=${sendAmount} conf_target=1`
      );
      console.log(
        `${sendAmount} BTC payed out for ${removalTx.transactionHash}`
      );
      const outgoingTxid = btcPayment.stdout.trim();
      await db.query(
        `UPDATE lp_payouts SET outgoing_txid=$1 WHERE burn_txid=$2`,
        [outgoingTxid, removalTx.transactionHash]
      );
    } catch (e) {
      console.error("BTC LP payout failed");
      console.error(e);
      continue;
    }
  }
});

runScript();
setInterval(() => {
  runScript();
}, SCRIPT_INTERVAL);
