import { scriptWrapper } from "./wrapper";
import {ethers} from 'ethers'
import * as depositContractAbi from './ZKSyncEraBridge.json'
import { Assets, MIN_ZZ_TOKEN_DEPOSIT, WADToAmount } from "./common";

const SCRIPT_INTERVAL = 5000

const runScript = scriptWrapper(async ({db, zkSyncEraProvider}) => {
  const depositContract = new ethers.Contract(process.env.ZKSYNC_ERA_DEPOSIT_CONTRACT as string, depositContractAbi.abi, zkSyncEraProvider)
  const recentDeposits = await depositContract.queryFilter(depositContract.filters.Deposit(), -100, -2)

  for (let deposit of recentDeposits) {
    if (deposit?.args?.token !== ethers.constants.AddressZero && deposit?.args?.token.toLowerCase() !== process.env.ZZ_TOKEN_ZKSYNC_ERA_CONTRACT_ADDRESS?.toLowerCase()) {
      // only eth and zz tokens supported
      continue
    }

    const depositAmount = WADToAmount(deposit?.args?.amount);
    const depositCurrency = deposit?.args?.token === ethers.constants.AddressZero ? Assets.ZKSync : Assets.ZZTokenZKSync

    if (depositCurrency === Assets.ZZTokenZKSync) {
      if (Number(depositAmount) < MIN_ZZ_TOKEN_DEPOSIT) {
        return
      }
    }
    
    const insertResult = await db.query(
      `INSERT INTO bridges(deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address)
       VALUES ($1,$2,$3,$4,NOW(),$5,$6)
       ON CONFLICT (deposit_txid) DO NOTHING`,
       [
        depositCurrency,
        deposit?.args?.initiator,
        depositAmount,
        deposit.transactionHash,
        deposit?.args?.out_chain,
        deposit?.args?.out_address
       ]
    )

    if (insertResult.rowCount === 1) {
      console.log(`${depositCurrency} deposit ${deposit.transactionHash} recorded`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL);