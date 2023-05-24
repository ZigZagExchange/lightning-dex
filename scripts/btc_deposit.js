import nodeChildProcess from 'node:child_process'
import util from 'node:util'
import pg from 'pg'

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'zap',
  user: 'postgres',
  password: 'postgres'
});

const exec = util.promisify(nodeChildProcess.exec);

updateDeposits();
setInterval(updateDeposits, 5000);

async function updateDeposits () {
  const { stdout, stderr } = await exec(`bitcoin-core.cli -testnet listtransactions`);
  const transactions = JSON.parse(stdout);
  const deposits = transactions.filter(t => t.category === "receive");
  for (let deposit of deposits) {
    console.log(deposit);
    const result = await db.query(
      "INSERT INTO bridges (deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp) VALUES ($1,$2,$3,$4,NOW()) ON CONFLICT (deposit_txid) DO NOTHING", 
      ["BTC", deposit.address, deposit.amount, deposit.txid]
    );
  }
}
