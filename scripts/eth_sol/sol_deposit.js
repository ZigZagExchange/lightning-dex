import pg from 'pg'
import {Connection, LAMPORTS_PER_SOL, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction} from '@solana/web3.js'
import dotenv from 'dotenv'
import crypto from 'crypto'
import bs58 from 'bs58'

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

updateDeposits()
setInterval(updateDeposits, 30000)

async function updateDeposits () {
  const {rows: depositRequests} = await db.query("SELECT * FROM sol_deposits WHERE expiry > NOW() AND completed = false")

  for (let request of depositRequests) {
    const addressSignatures = await connection.getConfirmedSignaturesForAddress2(new PublicKey(request.deposit_address))
    const addressTransactions = await connection.getParsedTransactions(addressSignatures.map(sig => sig.signature))
    const incomingTransactionOnly = addressTransactions.filter(wasTransactionNotSignedByAddress(request.deposit_address))
    const bridgesToInsert = incomingTransactionOnly.map(tx => {
      const txid = tx.transaction.signatures[0]
      const txValue = (tx.meta.preBalances[0] - tx.meta.postBalances[0] - tx.meta.fee) / LAMPORTS_PER_SOL
      return ['SOL', request.deposit_address, txValue, txid, request.outgoing_currency, request.outgoing_address]
    })

    const {rows: alreadyProcessedDeposits} = await db.query("SELECT deposit_txid FROM bridges WHERE deposit_currency='SOL'")
    const txidsOfAlreadyProcessedDeposits = alreadyProcessedDeposits.map(item => item.deposit_txid)
    const newDeposits = bridgesToInsert.filter(tx => !txidsOfAlreadyProcessedDeposits.includes(tx[3]))

    for (let deposit of newDeposits) {
      console.log(`inserting deposit: ${deposit[3]} - ${deposit[2]} SOL`)
      await db.query(`UPDATE sol_deposits SET completed = true WHERE id=$1`, [request.id])
      await db.query(
        `INSERT INTO bridges (deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address) 
         VALUES ($1,$2,$3,$4,NOW(),$5,$6) 
         ON CONFLICT (deposit_txid) DO NOTHING`, 
         deposit
      );

      transferFromDepositAddressToLiquidityPool(request.id)
    }
  }
}

async function transferFromDepositAddressToLiquidityPool (depositAddressId) {
  // derive keypair for wallet funds were deposited to
  const masterPrivateKey = process.env.SOL_LIQUIDITY_ACCOUNT_PRIV_KEY_BASE58
  const seed = crypto.createHash('sha256').update(Buffer.from(masterPrivateKey, 'utf-8')).update(depositAddressId).digest()
  const depositAccount = Keypair.fromSeed(seed)

  // get keypair for liqudiity pool account
  const liqudityPoolAccount = Keypair.fromSecretKey(bs58.decode(masterPrivateKey))
  const balance = await connection.getBalance(depositAccount.publicKey)

  const TX_FEE = 5000

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: depositAccount.publicKey,
      toPubkey: liqudityPoolAccount.publicKey,
      lamports: balance - TX_FEE
    })
  )

  const txid = await sendAndConfirmTransaction(
    connection,
    transaction,
    [depositAccount]
  )

  console.log(`traferring ${balance} LAMPORTS from ${depositAccount.publicKey.toString()} to liqudity pool (${txid})`)
}

function wasTransactionNotSignedByAddress (address) {
  return function (tx) {
    const transactionParticipants = tx.transaction.message.accountKeys
    const transactionSigner = transactionParticipants.find(participant => participant.signer)
    const transactionSignerPublicKey = transactionSigner.pubkey.toString()
    return transactionSignerPublicKey !== address
  }
}
