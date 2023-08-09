import { scriptWrapper } from "./wrapper";
import {ethers} from 'ethers'
import * as depositContractAbi from './BTCBridge.json'
import BN from 'bignumber.js'
import { Assets } from "./common";

const SCRIPT_INTERVAL = 5000

function WADToAmount (input: ethers.BigNumber): string {
  return new BN(input.toString()).div(1e18).toString()
}

const runScript = scriptWrapper(async ({db, ethProvider}) => {
  const depositContract = new ethers.Contract(process.env.ETH_DEPOSIT_CONTRACT as string, depositContractAbi.abi, ethProvider)
  const recentDeposits = await depositContract.queryFilter(depositContract.filters.Deposit(), -100, -2)

  for (let deposit of recentDeposits) {
    if (deposit?.args?.token !== ethers.constants.AddressZero) {
      // erc20s not yet supported
      continue
    }

    const depositAmount = WADToAmount(deposit?.args?.amount);
    const insertResult = await db.query(
      `INSERT INTO bridges(deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address)
       VALUES ($1,$2,$3,$4,NOW(),$5,$6)
       ON CONFLICT (deposit_txid) DO NOTHING`,
       [
        Assets.ETH,
        deposit?.args?.initiator,
        depositAmount,
        deposit.transactionHash,
        deposit?.args?.out_chain,
        deposit?.args?.out_address
       ]
    )

    if (insertResult.rowCount === 1) {
      console.log(`${Assets.ETH} deposit ${deposit.transactionHash} recorded`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL);