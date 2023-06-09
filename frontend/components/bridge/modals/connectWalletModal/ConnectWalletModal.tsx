import Image from "next/image"
import { useState, useContext } from "react"
import { useConnect, Connector } from 'wagmi'
import useHandleWallet from "../../../../hooks/useHandleWallet"
import { Chain, WalletContext } from "../../../../contexts/WalletContext"
import FlexBox from "../../../FlexBox"
import Loader from "../../../loader"
import styles from "./ConnectWalletModal.module.scss"

interface ConnectWalletModalProps {
    close: () => void
}

interface WalletItemProps {
    disabled: boolean
    icon: string
    name: string
    isLoading?: boolean
    handleConnect: () => void
}

const WalletItem = ({ disabled, icon, name, isLoading, handleConnect }: WalletItemProps) => (
    <FlexBox style={{ justifyContent: 'space-between' }}>
        <button className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-transparent  group transition-all duration-75 hover:!border-orange-500  hover:bg-[#5397F7] hover:bg-opacity-30"
            disabled={disabled}
            onClick={handleConnect}
        >
            <Image
                src={icon}
                alt="icon"
                className="w-8 mr-3 rounded-lg"
                width={20}
                height={20}
            />
            <span className="text-lg font-medium mt-0.5 transition-all duration-75 text-white">
                {name}
            </span>
        </button>
        {isLoading && <Loader />}
    </FlexBox>
)

function ConnectWalletModal({ close }: ConnectWalletModalProps) {
    const {
        handleConnectMetaMask,
        handleConnectPhantom,
    } = useHandleWallet()

    const { connectors } = useConnect()
    const {
        chain,
        isLoading,
        updateIsLoading,
        updateCurrentAction
    } = useContext(WalletContext)

    const [network, setNetwork] = useState('metaMask')

    const connectMetaMask = async (connector: Connector) => {
        updateIsLoading(true)
        try {
            setNetwork(connector.id)

            await handleConnectMetaMask(connector)
        } catch (err: any) {
            console.log(err?.message || err)
        } finally {
            updateIsLoading(false)
            close()
        }
    }

    const connectPhantom = async () => {
        updateIsLoading(true)

        try {
            await handleConnectPhantom()
        } catch (err: any) {
            console.log(err?.message || err)
        } finally {
            updateIsLoading(false)
            close()
        }
    }

    const handleClose = () => {
        close()
        updateCurrentAction('None')
    }

    return (
        <div className="rounded-lg relative flex flex-col w-full overflow-hidden outline-none focus:outline-none">
            <div className="inline-block px-6 pt-2 pb-4 overflow-hidden text-left align-bottom transition-all transform  rounded-lg shadow-xl sm:align-middle w-96 " role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                <div>
                    <div className="flex items-center">
                        <h3 className="pt-3" id="modal-headline">
                            <p className="mb-3 text-opacity-50 text-xl text-white font-bold">Connect a wallet</p>
                        </h3>

                        <div className="ml-auto cursor-pointer" onClick={handleClose}>
                            <div className="float-right text-sm text-red-500 hover:underline">Clear</div>
                        </div>
                    </div>

                    <p className="text-gray-400"></p>
                </div>

                <div className={styles.button_group}>
                    <div className="flex flex-col pt-4">
                        {chain === Chain.evm ? (
                            connectors.map((connector, id) => (
                                <WalletItem
                                    key={connector.id}
                                    icon={
                                        id === 0
                                            ? "/wallets/metamask.svg"
                                            : id === 1
                                                ? "/wallets/walletconnect.svg"
                                                : "/wallets/phantom.svg"
                                    }
                                    name={connector.name}
                                    isLoading={isLoading && network === connector.id}
                                    disabled={!connector.ready || isLoading}
                                    handleConnect={() => connectMetaMask(connector)}
                                />
                            ))
                        ) : (
                            <WalletItem
                                icon="/wallets/phantom.svg"
                                name='Phantom'
                                isLoading={isLoading}
                                disabled={isLoading}
                                handleConnect={connectPhantom}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConnectWalletModal