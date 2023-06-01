import Image from "next/image"
import { useContext, useState } from "react"
import { useAccount, useConnect, useDisconnect, Connector } from 'wagmi'
import usePhantom from "../../../../hooks/usePhantom"
import { Chain, WalletContext } from "../../../../contexts/WalletContext"
import styles from "./ConnectWalletModal.module.scss"
import { toast } from "react-toastify"

interface Props {
    close: () => void
}

interface WalletItemProps {
    disabled: boolean
    icon: string
    name: string
    handleConnect: () => void
}

const WalletItem = ({ disabled, icon, name, handleConnect }: WalletItemProps) => (
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
)

function ConnectWalletModal({ close }: Props) {
    const { disconnect } = useDisconnect()
    const { isConnected } = useAccount()
    const { connect, connectors, isLoading } = useConnect()
    const { chain, updateCurrentAction } = useContext(WalletContext)
    const { phantomProvider } = usePhantom()

    const [loading, setLoading] = useState(false)

    const handleConnectMetaMask = (connector: Connector) => {
        connect({ connector })
        close()
    }

    const handleConnectPhantom = () => {
        if (!phantomProvider) {
            toast.error('Please install Phantom Wallet!')
            return
        }

        if (isConnected) disconnect()

        setLoading(true)

        phantomProvider.connect({ onlyIfTrusted: true })
            .then(({ publicKey }: any) => {
                console.log(publicKey.toString())
                setLoading(false)
                close()
            })
            .catch(() => {
                setLoading(false)
                close()
            })
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
                                    disabled={!connector.ready || isLoading}
                                    handleConnect={() => handleConnectMetaMask(connector)}
                                />
                            ))
                        ) : (
                            <WalletItem
                                icon="/wallets/phantom.svg"
                                name='Phantom'
                                disabled={loading}
                                handleConnect={handleConnectPhantom}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConnectWalletModal