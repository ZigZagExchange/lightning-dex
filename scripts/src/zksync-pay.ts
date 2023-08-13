import { Assets } from "./common";
import { generateUSDPriceMap, getOutgoingAmountAndFee } from "./pricing";
import { scriptWrapper } from "./wrapper";
import {ethers} from 'ethers'

const SCRIPT_INTERVAL = 5000

const runScript = scriptWrapper(async ({db, zkSyncProvider}) => {
  const {rows: bridges} = await db.query(`SELECT * FROM bridges WHERE outgoing_currency = '${Assets.ZKSync}' AND paid = false AND outgoing_address IS NOT NULL`)

  if (bridges.length === 0) {
    return
  }
  
  const usdPriceMap = await generateUSDPriceMap()
  const wallet = new ethers.Wallet(process.env.ZKSYNC_PRIVATE_KEY as string, zkSyncProvider)

  const feeData = await zkSyncProvider.getFeeData()
  if (!feeData.gasPrice) {
    console.log('error fetching gas price')
    return
  }

  for (let bridge of bridges) {
    const {amountMinusFee, fee, outgoingAmount} = getOutgoingAmountAndFee(usdPriceMap, bridge.deposit_currency, bridge.outgoing_currency, bridge.deposit_amount)

    const makerBalance = await zkSyncProvider.getBalance(wallet.address)

    const networkFee = feeData.gasPrice?.mul(21000).mul(2)
    const amountMinusFeeWAD = ethers.utils.parseUnits(String(amountMinusFee), 18)
    const txValue = ethers.BigNumber.from(amountMinusFeeWAD).sub(networkFee)

    if (txValue.gte(makerBalance)) {
      console.log('ZKSync liqudiity is empty')
      continue
    }

    if (txValue.lte(0)) {
      console.log('outgoing tx would be for < 0 ZKSync')
      continue
    }

    const select_deposit = await db.query("SELECT paid FROM bridges WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (select_deposit.rows.length != 1 || select_deposit.rows[0].paid) {
      throw new Error("Double payment? Race condition activated");
    }

    const update_paid = await db.query("UPDATE bridges SET paid=true WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (update_paid.rowCount !== 1) {
      throw new Error("Weird failure in paid update")
    }

    const transaction = await wallet.sendTransaction({
      to: bridge.outgoing_address,
      value: txValue
    })
    await transaction.wait()

    const updateResult = await db.query(
      'UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW(), fee=$3 WHERE deposit_txid=$4',
      [transaction.hash, outgoingAmount, fee, bridge.deposit_txid]
    )
    if (updateResult.rowCount === 1) {
      console.log(`${bridge.deposit_currency} to ${bridge.outgoing_currency} executed ${transaction.hash}`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)