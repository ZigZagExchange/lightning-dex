/**
 * FOR ALL DEPOSITS THAT RECEIVED INITIATE THE WITHDRAWAL AT THE L2 BRIDGE GATEWAY
 */

import dotenv from 'dotenv'
import pg from 'pg'
import { generateEthKeyPairFromID } from './utils.js';
import {ethers} from 'ethers'

dotenv.config()

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: 'postgres'
});

const ethersProvider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL)

const L2_GATEWAY_ADDRESS = '0x4200000000000000000000000000000000000010'
const L2_ETH_TOKEN_ADDRESS = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000'
const L2_GATEWAY_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_l2Token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256"
      },
      {
        internalType: "uint32",
        name: "_minGasLimit",
        type: "uint32"
      },
      {
        internalType: "bytes",
        mame: "_extraData",
        type: "bytes"
      }
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
]

// need to figure out why this is reuqired
const GAS_FEE_BUFFER = 1000000000000000

submitWitdrawals()

async function submitWitdrawals () {
  const {rows: bridgesForWithdrawal} = await db.query('SELECT * FROM base_bridges WHERE amount IS NOT NULL AND withdrawal_txid is NULL')
  for (let bridge of bridgesForWithdrawal) {
    const intemediaryWallet = generateEthKeyPairFromID(bridge.id)
    const signer = new ethers.Wallet(intemediaryWallet.privateKey, ethersProvider)
    const balance = await ethersProvider.getBalance(signer.address)
    const contract = new ethers.Contract(L2_GATEWAY_ADDRESS, L2_GATEWAY_ABI, signer)
    const gasLimit = ethers.utils.hexlify(200000)
    const gasPrice = await ethersProvider.getGasPrice()
    const gasFee = gasPrice.mul(gasLimit)
    const amountToSend = balance.sub(gasFee).sub(GAS_FEE_BUFFER)
    console.log(amountToSend.toString())
    const tx = await contract.withdraw(L2_ETH_TOKEN_ADDRESS, amountToSend, 0, '0x', {from: signer.address, value: amountToSend, gasLimit})
    await db.query('UPDATE base_bridges SET withdrawal_txid = $1 WHERE id = $2', [tx.hash, bridge.id])
    console.log(`withdrawal submitted for ${bridge.id}`)
  }
}
