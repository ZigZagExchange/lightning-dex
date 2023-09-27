import { scriptWrapper } from "./wrapper";
import {ethers} from 'ethers'
import axios from 'axios'
import { Assets, MIN_ZZ_TOKEN_DEPOSIT, WADToAmount } from "./common";

const SCRIPT_INTERVAL = 5000

const ADDRESSES_THAT_DEPOSIT_LIQUIDITY = [
  '0xe4aded7c6515c73b83f6ac4c01930c8a40a1c43e'.toLowerCase(),
  '0xB10b3b7bAc1C209830458eDE1c1547D5AF28A6D1'.toLowerCase()
]

const runScript = scriptWrapper(async ({db}) => {
  const wallet = new ethers.Wallet(process.env.ZKSYNC_LITE_PRIVATE_KEY as string)
  const result = await axios(`https://api.zksync.io/api/v0.1/account/${wallet.address}/history/0/100`)
  const incomingTransactions = result.data.filter(
    (item: any) => item.tx.from?.toLowerCase() !== wallet.address.toLowerCase() &&
    !ADDRESSES_THAT_DEPOSIT_LIQUIDITY.includes(item.tx.from?.toLowerCase()) &&
    item.tx.type === 'Transfer' &&
    (item.tx.token === 'ZZ' || item.tx.token === 'ETH') &&
    item.success === true
  )

  for (let deposit of incomingTransactions) {
    const depositAsset = deposit.tx.token === 'ZZ' ? Assets.ZZTokenZKSyncLite : Assets.ZKSyncLite
    const depositAmount = WADToAmount(deposit.tx.amount)
    if (depositAsset === Assets.ZZTokenZKSyncLite && Number(depositAmount) < MIN_ZZ_TOKEN_DEPOSIT) {
      console.log(`${depositAmount} is less than the min ZZ deposit of ${MIN_ZZ_TOKEN_DEPOSIT}`)
      continue
    }
    const insertResult = await db.query(
      `INSERT INTO bridges(deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address)
       VALUES ($1,$2,$3,$4,NOW(),$5,$6)
       ON CONFLICT (deposit_txid) DO NOTHING`,
       [
        depositAsset,
        deposit.tx.from,
        WADToAmount(deposit.tx.amount),
        deposit.hash,
        depositAsset === Assets.ZZTokenZKSyncLite ? Assets.ZZTokenZKSync : Assets.ZKSync,
        deposit.tx.from
       ]
    )
    
    if (insertResult.rowCount === 1) {
      console.log(`${depositAsset} deposit ${deposit.hash} recorded`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)