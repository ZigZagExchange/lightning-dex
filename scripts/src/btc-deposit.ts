import { scriptWrapper } from "./wrapper";
import nodeChildProcess from 'node:child_process'
import util from 'node:util'
import { Assets } from "./common";

const SCRIPT_INTERVAL = 5000

const exec = util.promisify(nodeChildProcess.exec);

const runScript = scriptWrapper(async ({db}) => {
  const { stdout, stderr } = await exec(`${process.env.BITCOIN_CLI_PREFIX} listtransactions`);
  if (stderr) {
    return
  }
  const transactions = JSON.parse(stdout);
  const deposits = transactions.filter((tx: any) => tx.category === "receive" && tx.confirmations >= 1);
  for (let deposit of deposits) {
    const deposit_address_result = await db.query("SELECT * FROM deposit_addresses WHERE deposit_address=$1 AND deposit_currency='BTC'", [deposit.address]);
    if (deposit_address_result.rows.length != 1) continue;

    const outgoing_currency = deposit_address_result.rows[0].outgoing_currency;
    const outgoing_address = deposit_address_result.rows[0].outgoing_address;

    const bridge_data = ["BTC", deposit.address, deposit.amount, deposit.txid, outgoing_currency, outgoing_address];
    const result = await db.query(
      `INSERT INTO bridges (deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address) 
       VALUES ($1,$2,$3,$4,NOW(),$5,$6) 
       ON CONFLICT (deposit_txid) DO NOTHING`, 
       bridge_data
    );
    if (result.rowCount === 1) {
      console.log(`${Assets.SOL} deposit ${deposit.txid} recorded`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)