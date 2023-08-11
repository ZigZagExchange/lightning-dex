import { scriptWrapper } from "./wrapper";
import { ethers } from 'ethers'
import * as depositContractArtifact from './ZKSyncBridge.json'
import { Assets } from "./common";

const TARGET_PERCENTAGE = 10 // 10% of the liquidity pools balance
const SCRIPT_INTERVAL = 300000 // 5 mins

const runScript = scriptWrapper(async ({zkSyncProvider}) => {
  const liquidityWallet = new ethers.Wallet(process.env.ZKSYNC_PRIVATE_KEY as string, zkSyncProvider)
  const liqudityBalance = await zkSyncProvider.getBalance(liquidityWallet.address)
  const targetPercentageOfLiqudity = liqudityBalance.div(TARGET_PERCENTAGE)
  const contractBalance = await zkSyncProvider.getBalance(process.env.ZKSYNC_DEPOSIT_CONTRACT as string)
  const shouldWithdraw = contractBalance.gte(targetPercentageOfLiqudity)
  if (shouldWithdraw) {
    // withdraw contract balance to benficiary
    const contract = new ethers.Contract(process.env.ZKSYNC_DEPOSIT_CONTRACT as string, depositContractArtifact.abi, liquidityWallet)
    const tx = await contract.withdraw()
    await tx.wait()
    console.log(`${Assets.ZKSync} withdrawal to liqidity pool ${tx.hash}`)
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)