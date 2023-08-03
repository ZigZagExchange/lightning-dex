/**
 * SEARCH FOR DEPOSITS THAT ACTUALLY MADE AND ADD THEM TO THE DB
 */
import dotenv from 'dotenv'
import pg from 'pg'
import { WADToAmount, generateEthKeyPairFromID } from './utils.js';
import {ethers} from 'ethers'

dotenv.config()

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: 'postgres'
});

const ethersProvider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL)

processBaseDeposits()

async function processBaseDeposits () {
  const {rows: entriesInExpiryWindow} = await db.query('SELECT * FROM base_bridges WHERE deposit_expiry > NOW() AND amount IS NULL');
  for (let deposit of entriesInExpiryWindow) {
    const intermediaryWallet = generateEthKeyPairFromID(deposit.id)
    const intermediaryWalletBalance = await ethersProvider.getBalance(intermediaryWallet.publicKey)
    const formattedBalance = WADToAmount(intermediaryWalletBalance.toString())
    await db.query('UPDATE base_bridges SET amount = $1, deposit_timestamp = NOW() WHERE id = $2', [formattedBalance, deposit.id])
    console.log(`deposit ${deposit.id} received`)
  }
}