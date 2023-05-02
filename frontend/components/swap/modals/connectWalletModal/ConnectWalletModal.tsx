interface Props {
    close: () => void
}

function ConnectWalletModal({ close }: Props) {
    return (
        <div className="rounded-lg relative flex flex-col w-full overflow-hidden outline-none focus:outline-none bg-gray-800">
            <div className="inline-block px-6 pt-2 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-[#1A1B1F] rounded-lg shadow-xl sm:align-middle w-96 " role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                <div>
                    <div className="flex items-center">
                        <h3 className="pt-3" id="modal-headline">
                            <p className="mb-3 text-opacity-50 text-xl text-white font-bold">Connect a wallet</p>
                        </h3>

                        <div className="ml-auto cursor-pointer" onClick={close}>
                            <div className="float-right text-sm text-red-500 hover:underline">Clear</div>
                        </div>
                    </div>

                    <p className="text-gray-400"></p>
                </div>

                <div>
                    <div className="flex flex-col pt-4">
                        <button className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-[#1A1B1F]  group transition-all duration-75 hover:!border-orange-500  hover:bg-[#5397F7] hover:bg-opacity-30">
                            <img src="/wallets/metamask.svg" alt="icon" className="w-8 mr-3 rounded-lg" />
                            <span className="text-lg font-medium mt-0.5 transition-all duration-75 text-white">MetaMask</span>
                        </button>

                        <button className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-[#1A1B1F]  group transition-all duration-75 hover:!border-sky-500  hover:bg-[#5397F7] hover:bg-opacity-30">
                            <img src="/wallets/walletconnect.svg" alt="icon" className="w-8 mr-3 rounded-lg" />
                            <span className="text-lg font-medium mt-0.5 transition-all duration-75 text-white">Wallet Connect</span>
                        </button>

                        <button className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-[#1A1B1F]  group transition-all duration-75 hover:!border-yellow-500  hover:bg-[#5397F7] hover:bg-opacity-30">
                            <img src="/wallets/binance.svg" alt="icon" className="w-8 mr-3 rounded-lg" />
                            <span className="text-lg font-medium mt-0.5 transition-all duration-75 text-white">Binance Wallet</span>
                        </button>

                        <button className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-[#1A1B1F]  group transition-all duration-75 hover:!border-blue-500  hover:bg-[#5397F7] hover:bg-opacity-30">
                            <img src="/wallets/coinbase.svg" alt="icon" className="w-8 mr-3 rounded-lg" />
                            <span className="text-lg font-medium mt-0.5 transition-all duration-75 text-white">Coinbase Wallet</span>
                        </button>

                        <button className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-[#1A1B1F]  group transition-all duration-75 hover:!border-blue-500  hover:bg-[#5397F7] hover:bg-opacity-30">
                            <img src="/wallets/terra.png" alt="icon" className="w-8 mr-3 rounded-lg" />
                            <span className="text-lg font-medium mt-0.5transition-all duration-75text-white">Terra Station</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConnectWalletModal;