import { Connection, PublicKey } from '@solana/web3.js'

const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC as string

const getSolanaBalance = async (publicKey: PublicKey) => {
    const connection = new Connection(rpcUrl)

  try {
    const balance = await connection.getAccountInfo(publicKey)
    return balance?.lamports || 0
  } catch (error: any) {
    throw new Error('Error fetching Solana balance: ', error?.message || error)
  }
}

export default getSolanaBalance