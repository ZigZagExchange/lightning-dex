import { scriptWrapper } from "./wrapper";
import * as zksync from 'zksync'
import {ethers} from 'ethers'
import { Assets } from "./common";
import { generateUSDPriceMap, getOutgoingAmountAndFee } from "./pricing";

const SCRIPT_INTERVAL = 30000

const runScript = scriptWrapper(async ({db}) => {
  const provider = await zksync.getDefaultProvider('mainnet') // testnet is no existent
  const ethWallet = new ethers.Wallet(process.env.ZKSYNC_LITE_PRIVATE_KEY as string)
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, provider);
  const {rows: bridges} = await db.query(`SELECT * FROM bridges WHERE (outgoing_currency='${Assets.ZKSyncLite}' OR outgoing_currency='${Assets.ZZTokenZKSyncLite}') AND paid = false AND outgoing_address is NOT NULL AND deposit_timestamp > NOW() - INTERVAL '24 hours' LIMIT 50;`)

  if (bridges.length === 0) {
    return
  }

  const usdPriceMap = await generateUSDPriceMap()
  const batchBuilder = syncWallet.batchBuilder()
  const txMetadata = []

  for (let bridge of bridges) {
    const {amountMinusFee, fee, outgoingAmount} = getOutgoingAmountAndFee(usdPriceMap, bridge.deposit_currency, bridge.outgoing_currency, bridge.deposit_amount)
    txMetadata.push({fee, outgoingAmount})
    batchBuilder.addTransfer({
      to: bridge.outgoing_address,
      amount: ethers.utils.parseEther(String(amountMinusFee)),
      token: bridge.outgoing_currency === Assets.ZZTokenZKSyncLite ? 'ZZ' : 'ETH',
    })
  }

  const txBatch = await batchBuilder.build('ETH')

  const batch = await Promise.all(txBatch.txs.map(async ({tx}) => {
    const sig = await syncWallet.signSyncTransfer(tx as any)
    return {tx, signature: sig.ethereumSignature}
  }))
  const batchTxids = await provider.submitTxsBatch(batch)

  for (let i = 0; i < batchTxids.length; i++) {
    const updateResult = await db.query('UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW(), paid=true, fee=$3 WHERE deposit_txid=$4', [
      batchTxids[i],
      txMetadata[i].outgoingAmount,
      txMetadata[i].fee,
      bridges[i].deposit_txid
    ])
    if (updateResult.rowCount === 1) {
      console.log(`${bridges[i].deposit_currency} to ${bridges[i].outgoing_currency} executed ${batchTxids[i]}`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)