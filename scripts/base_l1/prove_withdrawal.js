/**
 * RUN THE WITHDRAWER SCRIPT ON ANY TXS THAT HAVE BEEN SUBMITTED TO THE L2 GATEWAY
 */
import dotenv from 'dotenv'
import pg from 'pg'
import {exec} from 'node:child_process'
import { generateEthKeyPairFromID } from './utils.js';
import {addDays} from 'date-fns'

dotenv.config()

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: 'postgres'
});

proveWithdrawals()

async function proveWithdrawals () {
  const {rows: withdrawalsToProve} = await db.query("SELECT * FROM base_bridges WHERE withdrawal_txid IS NOT NULL AND proofing_txid IS NULL")
  for (let withdrawal of withdrawalsToProve) {
    const intemedieryWallet = generateEthKeyPairFromID(withdrawal.id)
    console.log(`./withdrawer/withdrawer --network ${process.env.NETWORK} --withdrawal ${withdrawal.withdrawal_txid} --rpc ${process.env.L1_RPC_URL} --private-key ${intemedieryWallet.privateKey.substring(2)}`)
    const {stderr, stdout} = await exec(`../withdrawer/withdrawer --network ${process.env.NETWORK} --withdrawal ${withdrawal.withdrawal_txid} --rpc ${process.env.L1_RPC_URL} --private-key ${intemedieryWallet.privateKey.substring(2)}`)
    if (stderr) {
      console.log(`unable to prove withdrawal ${withdrawal.id}`)
      return
    }
    const output = JSON.stringify(stdout)
    if (!output.success) {
      console.log(`proving bridge ${withdrawal.id} failed`)
      return
    }
    const endOfProvingPeriod = addDays(new Date(), 7)
    await db.query(`UPDATE base_bridges SET proofing_txid = $1, proofing_period_end = to_timestamp($2)`, [output.txid, endOfProvingPeriod])
    console.log(`proof submitted for ${withdrawal.id}`)
  }
}