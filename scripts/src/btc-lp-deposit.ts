import util from "node:util";
import nodeChildProcess from "node:child_process";
import { scriptWrapper } from "./wrapper";
import { ethers } from "ethers";
import * as LPTokenContract from "./BTCLPToken.json";
import { amountToWAD } from "./common";

const SCRIPT_INTERVAL = 60000;

const exec = util.promisify(nodeChildProcess.exec);

const runScript = scriptWrapper(async ({ ethProvider, db }) => {
  const signer = new ethers.Wallet(
    process.env.ETH_PRIVKEY as string,
    ethProvider
  );
  const lpTokenContract = new ethers.Contract(
    process.env.BTC_LP_TOKEN_CONTRACT_ADDRESS as string,
    LPTokenContract.abi,
    signer
  );
  const { stdout, stderr } = await exec(
    `${process.env.BITCOIN_CLI_PREFIX} listtransactions`
  );
  if (stderr) {
    return;
  }

  const transactions = JSON.parse(stdout);
  const deposits = transactions.filter(
    (tx: any) => tx.category === "receive" && tx.confirmations >= 1
  );
  for (let deposit of deposits) {
    const { rows: depositRequests } = await db.query(
      "SELECT * FROM lp_deposits WHERE deposit_address=$1 AND deposit_currency='BTC' AND deposit_timestamp IS NULL",
      [deposit.address]
    );
    if (depositRequests.length !== 1) {
      continue;
    }
    const outgoingAddress = depositRequests[0].outgoing_address;
    const mintedTokenTx = await lpTokenContract.mint(
      outgoingAddress,
      amountToWAD(deposit.amount),
      { gasLimit: 500000 }
    );
    const finalizedMintTx = await mintedTokenTx.wait();
    const updateResult = await db.query(
      "UPDATE lp_deposits SET deposit_timestamp=NOW(), deposit_amount=$1, deposit_txid=$2, lp_token_mint_txid=$3 WHERE deposit_address=$4",
      [
        deposit.amount,
        deposit.txid,
        finalizedMintTx.transactionHash,
        deposit.address,
      ]
    );

    if (updateResult.rowCount === 1) {
      console.log(`${deposit.amount} BTC LP tokens minted`);
    }
  }
});

runScript();
setInterval(() => {
  runScript();
}, SCRIPT_INTERVAL);
