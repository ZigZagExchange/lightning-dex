import { ethers } from 'ethers'
import { Connection, PublicKey } from '@solana/web3.js'
import ERC20ABI from '../helpers/ERC20.abi.json'

const solRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC as string
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY as string

export const getEVMTokenBalance = async (
  walletAddress: string,
  tokenAddress: string,
  _chain: number,
  numOfDecimals: number,
) => {
  try {
    const chain = _chain === 1 ? 'mainnet' : _chain === 4 ? 324 : 'arbitrum'

    const provider = new ethers.providers.AlchemyProvider(chain, alchemyKey)

    // // Instantiate the ERC20 token contract using the token address and ABI
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider)

    // // Call the balanceOf method on the token contract to get the balance
    let _balance = await tokenContract.balanceOf(walletAddress)
    _balance = ethers.utils.formatEther(_balance)

    return (_balance * Math.pow(10, 18 - numOfDecimals)).toFixed(2)
  } catch (err: any) {
    throw new Error(err?.message || err)
  }
}

export const getSOLTokenBalance = async (publicKey: PublicKey) => {
  const connection = new Connection(solRpcUrl)

  try {
    const balance = await connection.getAccountInfo(publicKey)

    return balance?.lamports || 0
  } catch (error: any) {
    throw new Error('Error fetching Solana balance: ', error?.message || error)
  }
}

export const getSPLTokenBalance = async (walletAddress: string, tokenMintAddress: string) => {
  const data = {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenAccountsByOwner",
    params: [
      walletAddress,
      { mint: tokenMintAddress },
      { encoding: "jsonParsed" },
    ],
  }
  
  try {
    const response = await fetch(solRpcUrl, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    const res = await response.json()

    const balance = res?.result?.value[0].account.data.parsed.info.tokenAmount.uiAmountString

    return balance
  } catch (err: any) {
    throw new Error(err?.message || err)
  }
}
