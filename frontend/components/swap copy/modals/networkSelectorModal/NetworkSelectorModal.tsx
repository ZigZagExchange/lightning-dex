import Image from "next/image"
import styles from "./NetWorkSelectorModal.module.scss"

interface Props {
    close: () => void
}

function NetworkSelectorModal({ close }: Props) {
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
                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-[#5170ad] hover:!bg-opacity-20 hover:!border-[#5170ad]">
                        <Image src="/tokenIcons/eth.svg" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                        <div className="flex-col text-left">
                            <div className="text-white ">Ethereum</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-gray-500 hover:!bg-opacity-20 hover:!border-gray-500 bg-gray-500 active:bg-gray-700 border-gray-500 dark:border-gray-500 bg-opacity-50">
                        <Image src="/tokenIcons/abt.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                        <div className="flex-col text-left"><div className="text-white ">Arbitrum</div></div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-red-500 hover:!bg-opacity-20 hover:!border-red-500">
                        <Image src="/tokenIcons/avax.svg" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Avalanche</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-red-500 hover:!bg-opacity-20 hover:!border-red-500">
                        <Image src="/tokenIcons/bnb.svg" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                        <div className="flex-col text-left">
                            <div className="text-white ">BNB Chain</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-red-500 hover:!bg-opacity-20 hover:!border-red-500">
                        <Image src="/tokenIcons/opt.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} /><div className="flex-col text-left" >
                            <div className="text-white ">Optimism</div></div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-purple-500 hover:!bg-opacity-20 hover:!border-purple-500">
                        <Image src="/tokenIcons/pol.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                        <div className="flex-col text-left" >
                            <div className="text-white ">Polygon</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-lime-500 hover:!bg-opacity-20 hover:!border-lime-500">
                        <Image src="/tokenIcons/aur.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                        <div className="flex-col text-left"><div className="text-white ">Aurora</div></div></button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-lime-500 hover:!bg-opacity-20 hover:!border-lime-500">
                        <Image src="/tokenIcons/bob.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left" >
                            <div className="text-white ">Boba Network</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-teal-500 hover:!bg-opacity-20 hover:!border-teal-500">
                        <Image src="/tokenIcons/canto.svg" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Canto</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-blue-500 hover:!bg-opacity-20 hover:!border-blue-500">
                        <Image src="/tokenIcons/cronos.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Cronos</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-lime-500 hover:!bg-opacity-20 hover:!border-lime-500">
                        <Image src="/tokenIcons/dfk.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">DFK Chain</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-purple-500 hover:!bg-opacity-20 hover:!border-purple-500">
                        <Image src="/tokenIcons/dog.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Dogechain</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-blue-500 hover:!bg-opacity-20 hover:!border-blue-500">
                        <Image src="/tokenIcons/fantom.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white">Fantom</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-cyan-500 hover:!bg-opacity-20 hover:!border-cyan-500">
                        <Image src="/tokenIcons/harmony.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />
                        <div className="flex-col text-left">
                            <div className="text-white ">Harmony</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-orange-500 hover:!bg-opacity-20 hover:!border-orange-500">
                        <Image src="/tokenIcons/klaytn.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Klaytn</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-teal-500 hover:!bg-opacity-20 hover:!border-teal-500">
                        <Image src="/tokenIcons/metis.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Metis</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-teal-500 hover:!bg-opacity-20 hover:!border-teal-500">
                        <Image src="/tokenIcons/moonbeam.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Moonbeam</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-purple-500 hover:!bg-opacity-20 hover:!border-purple-500">
                        <Image src="/tokenIcons/moonriver.jfif" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Moonriver</div>
                        </div>
                    </button>

                    <button className="flex items-center transition-all duration-75 rounded-lg px-1 py-1 cursor-pointer border border-transparent hover:!bg-blue-500 hover:!bg-opacity-20 hover:!border-blue-500">
                        <Image src="/tokenIcons/terra.png" alt="Switch Network" className="w-6 h-6 mr-3 rounded-full" width={20} height={20} />

                        <div className="flex-col text-left">
                            <div className="text-white ">Terra</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NetworkSelectorModal