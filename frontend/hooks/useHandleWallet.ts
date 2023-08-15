import { useContext } from "react"
import { useConnect, useDisconnect, Connector, useSwitchNetwork } from 'wagmi'
import { PublicKey } from '@solana/web3.js'
import usePhantom from "./usePhantom"
import { WalletContext, Chain } from "../contexts/WalletContext"
import { getSOLTokenBalance } from "../utils/getTokenBalance"

const useHandleWallet = () => {
    const { phantomProvider } = usePhantom()
    const { connectAsync } = useConnect()
    const { disconnectAsync } = useDisconnect()
    const {
        isConnected,
        updateAddress,
        updateBalance,
        updateIsConnected,
    } = useContext(WalletContext)

    const handleConnectMetaMask = async (connector: Connector) => {
        try {
            if (isConnected === 'Phantom' && phantomProvider) {
                await phantomProvider.disconnect()
            }
            await connectAsync({ connector })
            updateIsConnected('MataMask')
        } catch (err: any) {
            throw new Error(err?.message || err)
        }
    }

    const handleConnectPhantom = async () => {
        if (!phantomProvider) {
            throw new Error('Please install Phantom Wallet!')
        }
        try {
            if (isConnected === 'MataMask') await disconnectAsync()

            const { publicKey }: { publicKey: PublicKey } = await phantomProvider.connect()
            const balance = await getSOLTokenBalance(publicKey)

            updateIsConnected('Phantom')
            updateAddress(publicKey.toString())
            updateBalance(`${(balance / Math.pow(10, 9)).toFixed(2)} SOL`)
        } catch (err: any) {
            throw(err?.message || err)
        }
    }

    const handleDisconnectMetaMask =async () => {
        try {
            await disconnectAsync()
            updateIsConnected(null)
            updateAddress('')
            updateBalance('0.00')
        } catch (error: any) {
            throw new Error(error?.message || error)
        }
    }

    const handleDisconnectPhantom =async () => {
        try {
            await phantomProvider.disconnect()
            updateIsConnected(null)
            updateAddress('')
            updateBalance('0.00')
        } catch (error: any) {
            throw new Error(error?.message || error)
        }
    }

    return {
        handleConnectMetaMask,
        handleConnectPhantom,
        handleDisconnectMetaMask,
        handleDisconnectPhantom,
        phantomProvider,
    }
}

export default useHandleWallet
 