import fetch from 'node-fetch'
import { ethers } from 'ethers'
import fs from 'fs'
import nodeChildProcess from 'node:child_process'
import util from 'node:util'
import dotenv from 'dotenv'

dotenv.config()

const exec = util.promisify(nodeChildProcess.exec);


const bridgeAbi = JSON.parse(fs.readFileSync('BTCBridge.abi.json', "utf-8"));

const arbitrumRpc = "https://arb1.arbitrum.io/rpc"
const ethersProvider = new ethers.providers.JsonRpcProvider(arbitrumRpc, 42161);
const ethersWallet = new ethers.Wallet(process.env.ARBITRUM_PRIVATE_KEY, ethersProvider).connect(ethersProvider);

const BRIDGE_ADDRESS = "0x7F6678cdBC715F15501342ecFB34ABCC903cBF6F";
const Bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, ethersProvider);
const BridgeSigner = Bridge.connect(ethersWallet);

Bridge.on("DepositCreated", async (initiator, wbtc_amount, expiry, hash) => {
  const payment_hash = hash.slice(2);
  console.log("Payment Hash:", payment_hash);
  const hash_data = await fetch(`https://api.bitcoin.zigzag.exchange/hash/${payment_hash}`).then(r => r.json());
  const invoice = hash_data.invoice;
  console.log("Paying invoice:", invoice);
  const { stdout, stderr } = await exec(`lncli payinvoice ${invoice} --force`);
  console.log(stdout, stderr);
  const payment_details_response = await exec(`lncli trackpayment ${payment_hash} --json`);
  const payment_details = JSON.parse(payment_details_response.stdout);

  const unlockTx = await BridgeSigner.unlockDepositHash(hash, '0x' + payment_details.payment_preimage);
  const unlockReceipt = await unlockTx.wait();
  console.log(`Unlocked ${payment_hash}`);
  console.log(unlockReceipt);
})
