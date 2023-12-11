import { Assets } from "./common";
import { generateUSDPriceMap, getOutgoingAmountAndFee } from "./pricing";
import { scriptWrapper } from "./wrapper";
import {ethers} from 'ethers'
import ERC20ABI from './ERC20.json'

const SCRIPT_INTERVAL = 30000

const runScript = scriptWrapper(async ({db, zkSyncEraProvider}) => {
  const {rows: bridges} = await db.query(`SELECT * FROM bridges WHERE (outgoing_currency='${Assets.ZKSync}' OR outgoing_currency='${Assets.ZZTokenZKSync}') AND paid = false AND outgoing_address IS NOT NULL AND deposit_timestamp > NOW() - INTERVAL '24 hours'`)

  if (bridges.length === 0) {
    return
  }
  
  const usdPriceMap = await generateUSDPriceMap()
  const wallet = new ethers.Wallet(process.env.ZKSYNC_ERA_PRIVATE_KEY as string, zkSyncEraProvider)
  const zzTokenContract = new ethers.Contract(process.env.ZZ_TOKEN_ZKSYNC_ERA_CONTRACT_ADDRESS as string, ERC20ABI, wallet)

  const feeData = await zkSyncEraProvider.getFeeData()
  if (!feeData.gasPrice) {
    console.log('error fetching gas price')
    return
  }

  for (let bridge of bridges) {
    const {amountMinusFee, fee, outgoingAmount} = getOutgoingAmountAndFee(usdPriceMap, bridge.deposit_currency, bridge.outgoing_currency, bridge.deposit_amount)

    const makerETHBalance = await zkSyncEraProvider.getBalance(wallet.address)
    const makerZZBalance = await zzTokenContract.balanceOf(wallet.address)

    const networkFee = feeData.gasPrice?.mul(21000).mul(2)
    const amountMinusFeeWAD = ethers.utils.parseUnits(String(amountMinusFee), 18)
    const txValue = ethers.BigNumber.from(amountMinusFeeWAD).sub(networkFee)


    const select_deposit = await db.query("SELECT paid FROM bridges WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (select_deposit.rows.length != 1 || select_deposit.rows[0].paid) {
      throw new Error("Double payment? Race condition activated");
    }

    const update_paid = await db.query("UPDATE bridges SET paid=true WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (update_paid.rowCount !== 1) {
      throw new Error("Weird failure in paid update")
    }

    if (txValue.lte(0)) {
      console.log(`outgoing tx would be for < 0 ${bridge.outgoing_currency}`, amountMinusFeeWAD.toString())
      continue
    }

    const sendTransaction = async () => {
      if (bridge.outgoing_currency === Assets.ZKSync) {
        if (txValue.gte(makerETHBalance)) {
          console.log('ZKSync liqudiity is empty')
          return
        }
        const transaction = await wallet.sendTransaction({
          to: bridge.outgoing_address,
          value: txValue
        })
        await transaction.wait()
        return transaction.hash
      } else if (bridge.outgoing_currency === Assets.ZZTokenZKSync) {
        if (txValue.gte(makerZZBalance)) {
          console.log('ZKSync ZZ token liqudiity is empty')
          return
        }
        const transcation = await zzTokenContract.transfer(bridge.outgoing_address, txValue)
        await transcation.wait()
        return transcation.hash
      } else {
        throw new Error(`${bridge.outgoing_currency} not supported by zksync-era-pay`)
      }
    }

    const txid = await sendTransaction()

    if (txid) {
      const updateResult = await db.query(
        'UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW(), fee=$3 WHERE deposit_txid=$4',
        [txid, outgoingAmount, fee, bridge.deposit_txid]
      )
      if (updateResult.rowCount === 1) {
        console.log(`${bridge.deposit_currency} to ${bridge.outgoing_currency} executed ${txid}`)
      }
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)
