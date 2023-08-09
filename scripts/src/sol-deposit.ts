import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { scriptWrapper } from "./wrapper";
import { Assets } from "./common";
import * as crypto from 'crypto'
import bs58 from 'bs58'

const SCRIPT_INTERVAL = 30000

const runScript = scriptWrapper(async ({db, solConnection}) => {
  const {rows: depositRequests} = await db.query('SELECT * FROM sol_deposits WHERE expiry > NOW() AND completed = false')
  
  for (let request of depositRequests) {
    const intemedieryWalletTxs = await solConnection.getConfirmedSignaturesForAddress2(new PublicKey(request.deposit_address))
    if (intemedieryWalletTxs.length === 0) {
      // user has not deposited funds to intemediery wallet yet
      continue
    }
    const depositTransaction = await solConnection.getTransaction(intemedieryWalletTxs[0].signature)
    const depositTxid = depositTransaction?.transaction.signatures[0]
    const {rows: existingDeposits} = await db.query(`SELECT * FROM bridges WHERE deposit_txid = $1 AND deposit_currency = '${Assets.SOL}'`, [depositTxid])
    if (existingDeposits.length > 0) {
      // deposit has already been processed
      continue
    }
    const depositAmount = ((depositTransaction?.meta?.preBalances[0] || 0) - (depositTransaction?.meta?.postBalances[0] || 0) - (depositTransaction?.meta?.fee || 0)) / LAMPORTS_PER_SOL
    await transferFromDepositAddressToLiquidityPool(request.id, solConnection)
    await db.query(`UPDATE sol_deposits SET completed = true WHERE id=$1`, [request.id])
    const insertResult = await db.query(
      `INSERT INTO bridges (deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address) 
       VALUES ($1,$2,$3,$4,NOW(),$5,$6) 
       ON CONFLICT (deposit_txid) DO NOTHING`,
       [Assets.SOL, request.deposit_address, depositAmount, depositTxid, request.outgoing_currency, request.outgoing_address]
    )
    if (insertResult.rowCount === 1) {
      console.log(`${Assets.SOL} deposit ${depositTxid} recorded`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)

async function transferFromDepositAddressToLiquidityPool (depositAddressId: string, connection: Connection) {
  // derive keypair for wallet funds were deposited to
  const masterPrivateKey = process.env.SOL_LIQUIDITY_ACCOUNT_PRIV_KEY_BASE58 as string
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

  if (!txid) {
    throw new Error('unable to transfer deposit to liqudiity pool')
  }
}