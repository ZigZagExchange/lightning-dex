import { scriptWrapper } from "./wrapper";
import { ethers } from "ethers";
import * as LPTokenContract from "./BTCLPToken.json";
import util from "node:util";
import nodeChildProcess from "node:child_process";

const exec = util.promisify(nodeChildProcess.exec);

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
    const tokenId = removalTx.args?.tokenId?.toNumber();
    if (!tokenId) {
      continue;
    }
    const withdrawalAddress = removalTx.args?.withdrawalAddress;

    const { rows: lpDeposits } = await db.query(
      "SELECT * FROM lp_deposits WHERE deposit_currency='BTC' AND lp_token_id=$1 AND has_been_removed=false",
      [tokenId]
    );

    if (lpDeposits.length !== 1) {
      throw new Error("duplicate NFTs of claims?");
    }

    const deposit = lpDeposits[0];

    const networkFee = JSON.parse(feeCheck.stdout).feerate / 3; // Estimated 333 vB
    const balanceCheck = await exec(
      `${process.env.BITCOIN_CLI_PREFIX} getwalletinfo`
    );
    const walletInfo = JSON.parse(balanceCheck.stdout);

    if (walletInfo.balance < Number(deposit.deposit_amount)) {
      console.log("BTC liquidity is empty");
      continue;
    }

    const updatePaid = await db.query(
      "UPDATE lp_deposits SET has_been_removed=TRUE WHERE deposit_currency='BTC' AND lp_token_id=$1",
      [tokenId]
    );
    if (updatePaid.rowCount !== 1) {
      throw new Error("Weird failure in paid update");
    }

    let btcPayment;
    let sendAmount;
    try {
      sendAmount = (deposit.deposit_amount - networkFee).toFixed(8);
      btcPayment = await exec(
        `${process.env.BITCOIN_CLI_PREFIX} -named sendtoaddress address=${withdrawalAddress} amount=${sendAmount} conf_target=1`
      );
    } catch (e) {
      console.error("Withdraw failed");
      console.error(e);
      continue;
    }
    const outgoingTxid = btcPayment.stdout.trim();

    const updateResult = await db.query(
      "UPDATE lp_tokens SET withdrawal_txid=$1 WHERE deposit_currency='BTC' AND lp_token_id=$2",
      [outgoingTxid, tokenId]
    );
    if (updateResult.rowCount === 1) {
      console.log(`Liquidity has been removed from token ${tokenId}`);
    }
  }
});

runScript();
