import dotenv from 'dotenv'
import pg from 'pg'
import bs58 from 'bs58'
import {Keypair, Connection, LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction} from '@solana/web3.js'
import {reportError} from './errors.js'
import {fetchPrices, getOutAmountAndFee} from './utils.js'

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

async function makePayments () {
  const result = await db.query("SELECT * FROM bridges WHERE paid=false AND outgoing_currency = 'SOL' AND outgoing_address IS NOT NULL AND deposit_currency='ETH'");
  if (result.rows.length === 0) {
    setTimeout(makePayments, 5000);
    return;
  }

  const keyPair = getSolanaKeyPair()

  let depositUsdPrice
  let outgoingUsdPrice;
  try {
    const {ethUsd, solUsd} = await fetchPrices()
    depositUsdPrice = ethUsd
    outgoingUsdPrice = solUsd
  } catch (error) {
    await reportError('error getting prices', error)
    return
  }

  
  for (let bridge of result.rows) {

    let makerBalance;
    try {
      makerBalance = await connection.getBalance(keyPair.publicKey)
    } catch (error) {
      setTimeout(makePayments, 5000);
      await reportError('Error while getting maker balance', error)
      return;
    }

    let readableOutgoingAmount;
    let readableBridgeFee;
    try {
      const {amountMinusFee, fee} = await getOutAmountAndFee('ETH', 'SOL', depositUsdPrice, outgoingUsdPrice, bridge.deposit_amount)
      readableOutgoingAmount = amountMinusFee
      readableBridgeFee = fee
    } catch (error) {
      console.log(error)
      await reportError('error calculating outgoing amounts', error)
    }

    const outgoingAmount = Number((readableOutgoingAmount * LAMPORTS_PER_SOL).toFixed(0))

    if (makerBalance <= outgoingAmount) continue

    const select = await db.query("SELECT paid FROM bridges WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (select.rows.length != 1 || select.rows[0].paid) throw new Error("Double payment? Race condition activated");

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
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW(), paid=true, fee=$3 WHERE deposit_txid = $4", 
      [transactionSignature, readableOutgoingAmount, readableBridgeFee, bridge.deposit_txid]
    );
    console.log(`Trade Executed: ${bridge.deposit_amount} ETH for ${readableOutgoingAmount} SOL. Price ${depositUsdPrice / outgoingUsdPrice}. TXID: ${transactionSignature}`);
  }

  setTimeout(makePayments, 5000);
}

function getSolanaKeyPair () {
  const decoded = bs58.decode(process.env.SOL_LIQUIDITY_ACCOUNT_PRIV_KEY_BASE58)
  return Keypair.fromSecretKey(decoded)
}
