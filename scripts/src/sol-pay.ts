import { Assets } from "./common";
import { scriptWrapper } from "./wrapper";
import bs58 from 'bs58'
import {Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, sendAndConfirmTransaction} from '@solana/web3.js'
import { generateUSDPriceMap, getOutgoingAmountAndFee } from "./pricing";

const SCRIPT_INTERVAL = 5000

function getSolanaKeyPair () {
  const decoded = bs58.decode(process.env.SOL_LIQUIDITY_ACCOUNT_PRIV_KEY_BASE58 as string)
  return Keypair.fromSecretKey(decoded)
}

const runScript = scriptWrapper(async ({db, solConnection}) => {
  const {rows: bridges} = await db.query(`SELECT * FROM bridges WHERE paid=false AND outgoing_currency = '${Assets.SOL}' AND outgoing_address IS NOT NULL`)

  if (bridges.length === 0) {
    return
  }

  const usdPriceMap = await generateUSDPriceMap()

  const masterKeyPair = getSolanaKeyPair()

  for (let bridge of bridges) {
    const makerBalance = await solConnection.getBalance(masterKeyPair.publicKey)

    const {amountMinusFee, fee, outgoingAmount} = getOutgoingAmountAndFee(usdPriceMap, bridge.deposit_currency, Assets.SOL, bridge.deposit_amount)

    if (makerBalance <= amountMinusFee * LAMPORTS_PER_SOL) {
      console.log('SOL liqudiity is empty')
      return
    }

    if (amountMinusFee < 0) {
      console.log('outgoing tx would be for < 0 SOL')
      return
    }

    const duplicates = await db.query("SELECT * FROM bridges WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (duplicates.rowCount !== 1) {
      throw new Error(`double deposit detected ${bridge.deposit_txid}`)
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: masterKeyPair.publicKey,
        toPubkey: new PublicKey(bridge.outgoing_address),
        lamports: Number((amountMinusFee * LAMPORTS_PER_SOL).toFixed(0))
      })
    )

    const transactionSignature = await sendAndConfirmTransaction(
      solConnection,
      transaction,
      [masterKeyPair]
    )

    await db.query(
      'UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW(), paid=true, fee=$3 WHERE deposit_txid = $4',
      [transactionSignature, outgoingAmount, fee, bridge.deposit_txid]
    )

    console.log(`${bridge.deposit_currency} to ${bridge.outgoing_currency} executed ${transactionSignature}`)
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)