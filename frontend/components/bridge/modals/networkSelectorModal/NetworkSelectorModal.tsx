import { useContext } from "react"
import { toast } from 'react-toastify'
import Image from "next/image"
import { useConnect, useDisconnect, Connector, useSwitchNetwork, useNetwork } from "wagmi"
import { PublicKey } from '@solana/web3.js'
import { styled } from "styled-components"

import styles from "./NetWorkSelectorModal.module.scss"
import usePhantom from "../../../../hooks/usePhantom"
import { networksItems } from "../../../../utils/data"
import { Chain, WalletContext } from "../../../../contexts/WalletContext"
import { getSOLTokenBalance } from "../../../../utils/getTokenBalance"


interface Props {
    close: () => void
}

const NetworkItem: any = styled.div`
  button{
    width: 100%;

    &:hover, &.active {
      background-color: ${(props: any) => props.color + "50"};
      border-color: ${(props: any) => props.color};
    }
  }
`

function NetworkSelectorModal({ close }: Props) {
    const { switchNetworkAsync } = useSwitchNetwork()
    const { orgChainId } = useContext(WalletContext)
    const { phantomProvider } = usePhantom()
    const { connectAsync, connectors } = useConnect()
    const { disconnectAsync } = useDisconnect()
    const {
        isLoading,
        isConnected,
        updateAddress,
        updateBalance,
        updateChain,
        updateIsLoading,
        updateIsConnected,
        updateOrgChainId,
    } = useContext(WalletContext)

    const handleConnectMetaMask = async (connector: Connector) => {
        try {
            updateIsLoading(true)
            if (isConnected === 'Phantom' && phantomProvider) {
                await phantomProvider.disconnect()
            }
            await connectAsync({ connector })
            updateIsConnected('MataMask')
            updateChain(Chain.evm)
        } catch (err: any) {
            console.log(err?.message || err)
        } finally {
            updateIsLoading(false)
            close()
        }
    }

    const handleConnectPhantom = async () => {
        try {
            if (!phantomProvider) {
                console.log('Please install Phantom Wallet!')
                return
            }

            updateIsLoading(true)

            if (isConnected === 'MataMask') await disconnectAsync()

            const { publicKey }: { publicKey: PublicKey } = await phantomProvider.connect()
            const balance = await getSOLTokenBalance(publicKey)

            updateIsConnected('Phantom')
            updateChain(Chain.solana)
            updateOrgChainId(2)
            updateAddress(publicKey.toString())
            updateBalance(`${(balance / Math.pow(10, 9)).toFixed(2)} SOL`)
        } catch (err: any) {
            console.log(err?.message || err)
        } finally {
            updateIsLoading(false)
            close()
        }
    }

    const changeNetwork = async (id: number) => {
        if (id === 3) return

        try {
            updateIsLoading(true)
            if (id === 2) {
                await handleConnectPhantom()
            } else {
                if (isConnected !== 'MataMask') {
                    await handleConnectMetaMask(connectors[0])
                }
                updateOrgChainId(id)
                updateChain(Chain.evm)
                await switchNetworkAsync?.(id === 4 ? 324 : id)
            }
        } catch (err: any) {
            console.log(err?.message)
        } finally {
            updateIsLoading(false)
            close()
        }
    }

    return (
        <div className="border-0 rounded-lg relative flex flex-col w-full outline-none focus:outline-none">
            <div className="inline-block rounded-xl pt-2 px-6 pb-4 text-left overflow-hidden transform transition-all w-96 align-bottom sm:align-middle bg-bgLight">
                <div>
                    <div className="flex items-center pt-3">
                        <h3 className="pt-3" id="modal-headline">
                            <p className="mb-3 text-sm text-secondaryTextColor text-opacity-50 undefined">Select Network</p>
                        </h3>

                        <div className="ml-auto cursor-pointer" onClick={close}>
                            <div className="float-right text-sm text-red-500 hover:underline">Clear
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-400"></p>
                </div>

                <div className={`${styles.token_container} flex flex-col space-y-3 overflow-y-auto scrollbar-hide py-2 max-h-[80vh]`}>
                    {
                        networksItems.map((item, index) =>
                            <NetworkItem color={item.color} key={`${item.name} + ${index}`}>
                                <button
                                    className={`${orgChainId === item.id ? "active" : ""}  flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent`}
                                    disabled={item.id === orgChainId}
                                    onClick={() => changeNetwork(item.id)}
                                >
                                    <Image src={`/tokenIcons/${item.icon}`} alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                                    <div className="flex-col text-left">
                                        <div className="text-white ">{item.name}</div>
                                    </div>
                                </button>
                            </NetworkItem>
                        )}
                </div>
            </div>
        </div>
    )
}

export default NetworkSelectorModal