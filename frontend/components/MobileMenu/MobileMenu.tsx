import Image from "next/image"
import Link from "next/link"

import logo from "../../public/img/zz.svg"
import { useState } from "react"

interface Props {
    networkSelectorModalOpen: () => void,
    openConnectWalletModal: () => void
}

function MobileMenu({ networkSelectorModalOpen, openConnectWalletModal }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="lg:hidden">
            <div className={`absolute inset-x-0 top-0 z-[20] transition origin-top-right transform ${!isOpen ? "hidden" : ""}`}>
                <div className="h-full min-h-full divide-y divide-gray-600 bg-[#0f1a26]">
                    <div className="px-4 pt-1 pb-6">
                        <div className="flex items-center justify-between mt-5 ml-3">
                            <div className="flex items-center flex-shrink-0 py-1 ">
                                <Image src={logo} alt="logo" width="30" height={"50"} />
                            </div>

                            <div className="-mr-2">
                                <button className="rounded-lg p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-400 hover:bg-gray-900 focus:outline-none" type="button" onClick={() => { setIsOpen(false) }}>
                                    <span className="sr-only">Close menu</span>

                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="grid grid-cols-1 gap-2  py-6 ">
                                <Link href="/about" className="block  px-3 pt-2 pb-2 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-opacity-100">
                                    <p className="text-white">About</p>
                                </Link>

                                <Link href="/bridge" className="block  px-3 pt-2 pb-2 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-opacity-100">
                                    <p className="text-white text-opacity-30">Bridge</p>
                                </Link>

                                <Link href="/" className="block  px-3 pt-2 pb-2 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-opacity-100">
                                    <p className="text-white text-opacity-30">Swap</p>
                                </Link>

                                <Link href="/pool" className="block  px-3 pt-2 pb-2 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-opacity-100">
                                    <p className="text-white text-opacity-30">Pools</p>
                                </Link>

                                <Link href="/stake" className="block  px-3 pt-2 pb-2 rounded-lg text-[rgba(255,255,255,0.5)] hover:text-opacity-100">
                                    <p className="text-white text-opacity-30">Stake</p>
                                </Link>

                                <Link href="/explorer" target="_blank" className="block  px-3 pt-2 pb-2 rounded-lg  hover:text-opacity-100">
                                    <p className="text-white text-opacity-30">Explorer</p>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4  px-4 py-4">
                        <div className="inline-block">
                            <div className="flex items-center">
                                <button className="group text-white outline-none active:outline-none ring-none transition-all duration-100 transform-gpu w-full cursor-pointer rounded-lg py-2 pl-2.5 pr-2.5 group focus:outline-none focus:ring-0 border border-transparent bg-transparent focus:bg-transparent active:bg-transparent hover:!border-gray-500"
                                    onClick={networkSelectorModalOpen}>
                                    <div>
                                        <div className="justify-center inline-block align-middle">
                                            <div className="flex w-full text-sm">
                                                <div className="flex items-center space-x-1 overflow-hidden">
                                                    <div className="text-base truncate">0.0 ETH</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="inline-block" onClick={openConnectWalletModal}>
                            <div className="flex items-center">
                                <button className="group cursor-pointer text-white outline-none active:outline-none ring-none transition-all duration-100 transform-gpu w-full rounded-lg py-2 pl-2.5 pr-2.5 group focus:outline-none focus:ring-0 hover:bg-opacity-70 bg-bgLight hover:bg-bgLightest focus:bg-bgLightest active:bg-bgLightest border border-transparent hover:!border-orange-500 undefined">
                                    <div className="space-x-2">
                                        <div className="inline-block rounded-md  text-sm font-medium text-white  group-hover:bg-opacity-10 tracking-wide">
                                            <div className="">0xE09b...228C</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="items-center justify-center -mr-2 sm:flex lg:hidden" onClick={() => { setIsOpen(true) }}>
                <button className="rounded-lg p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-400 hover:bg-gray-800 focus:outline-none" id="headlessui-popover-button-3" type="button" aria-expanded="false">
                    <span className="sr-only">Open menu</span>

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div >
    )
}

export default MobileMenu