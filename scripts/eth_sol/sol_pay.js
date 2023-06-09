import dotenv from 'dotenv'
import pg from 'pg'
import fetch from 'node-fetch'
import bs58 from 'bs58'
import {Keypair, Connection, LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction} from '@solana/web3.js'

dotenv.config()

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: 'postgres'
});

const connection = new Connection(
  process.env.SOLANA_CONNECTION_URL,
  "confirmed"
);

makePayments()

const FEE_MULTIPLIER = 0.998

async function makePayments () {
  const result = await db.query("SELECT * FROM bridges WHERE paid=false AND outgoing_currency = 'SOL' AND outgoing_address IS NOT NULL AND deposit_currency='ETH'");

  const keyPair = getSolanaKeyPair()

  let solEthPrice;
  try {
    solEthPrice = await getSolEthPrice()
  } catch (e) {
    console.error("Error getting ETH-SOL price");
    console.error(e);
    setTimeout(makePayments, 5000);
  }

  if (typeof solEthPrice !== 'number' || isNaN(solEthPrice)) throw new Error('ethsol price is not valid')

  const makerBalance = await connection.getBalance(keyPair.publicKey)
  
  for (let bridge of result.rows) {
    const readableOutgingAmount = bridge.deposit_amount * solEthPrice
    const outgoingAmount = Number((readableOutgingAmount * LAMPORTS_PER_SOL * FEE_MULTIPLIER).toFixed(0))

    if (makerBalance <= outgoingAmount) continue

    const update_paid = await db.query("UPDATE bridges SET paid=true WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (update_paid.rowCount !== 1) throw new Error("Weird failure in paid update");

    if (outgoingAmount <= 0) {
      console.log("Payment skipped. Outgoing amount would be negative");
      continue;
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keyPair.publicKey,
        toPubkey: new PublicKey(bridge.outgoing_address),
        lamports: outgoingAmount
      })
    )

    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [keyPair]
    )

    await db.query(
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW() WHERE deposit_txid = $3", 
      [transactionSignature, readableOutgingAmount, bridge.deposit_txid]
    );
    console.log(`Trade Executed: ${bridge.deposit_amount} ETH for ${readableOutgingAmount} SOL. Price ${solEthPrice}. TXID: ${transactionSignature}`);
  }

  setTimeout(makePayments, 5000);
}

function getSolEthPrice () {
  return fetch('https://api.coincap.io/v2/assets', {
    headers: {
      'Authorization': `Bearer ${process.env.COIN_CAP_API_KEY}`
    }
  }).then(res => res.json()).then(({data}) => {
    const etheremPrice = data.find(asset => asset.id === 'ethereum').priceUsd
    const solanaPrice = data.find((asset) => asset.id === 'solana').priceUsd
    return Number(etheremPrice) / Number(solanaPrice)
  })
}

function getSolanaKeyPair () {
  const decoded = bs58.decode(process.env.SOL_LIQUIDITY_ACCOUNT_PRIV_KEY_BASE58)
  return Keypair.fromSecretKey(decoded)
}
