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

    try {
      const sendAmount = (outgoingBtcAmount - networkFee).toFixed(8);
      await exec(
        `${process.env.BITCOIN_CLI_PREFIX} -named sendtoaddress address=${withdrawalAddress} amount=${sendAmount} conf_target=1`
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
