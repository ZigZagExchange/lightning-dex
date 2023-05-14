import { useEffect, useState } from "react"

interface props {
    show: boolean,
    onClick: (value: boolean) => void
}

export default function SettingsDropdown({ show, onClick }: props) {
    const [expanded, setExpanded] = useState(false)
    const [showDeadlineTitle, setShowDeadlineTitle] = useState(false)
    const [showAddressTitle, setShowAddressTitle] = useState(false)
    const [showAddress, setShowAddress] = useState(false)

    useEffect(() => {
        setExpanded(true)
    }, [show])

    const collapse = () => {
        setExpanded(false)
        onClick(false)
    }

    return (
        <div className={`droplist origin-bottom absolute w-full h-full md:w-[95%] -ml-0 md:-ml-3 md:-mt-3 bg-bgBase z-20 rounded-3xl ${show ? "active" : ""}`}>
            <div className="max-h-full pb-4 overflow-auto rounded-3xl">
                <div className="px-3 md:px-6 rounded-xl text-base focus:outline-none  overflow-hidden z-10 w-full  space-y-4">
                    <div className="pt-8">
                        <div className="flex items-center mb-4 text-sm font-[400] text-white">Deadline
                            <div className="inline-block" onMouseOver={() => setShowDeadlineTitle(true)} onMouseLeave={() => setShowDeadlineTitle(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-4 h-4 ml-1 cursor-pointer text-[#252027] fill-bgLighter">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>

                            <div className="overflow-visible">
                                <div className={`absolute bg-black border-0 mt-3 z-50 font-normal leading-normal text-sm max-w-xs text-left no-underline break-words rounded-lg ${!showDeadlineTitle ? 'hidden' : ''}`}>
                                    <div>
                                        <div className="p-3 font-[400] text-white">Enter deadline in minutes</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex h-16 pb-4 space-x-2 text-left">
                            <div className="flex flex-grow items-center h-14 w-full bg-bgLight border border-transparent hover:border-gradient-br-magenta-melrose-bgLight hover:border-solid  focus-within:border-gradient-br-magenta-melrose-bgLight focus-within:border-solid  pl-1 py-0.5 rounded-xl">
                                <input
                                    pattern="[0-9.]+"
                                    className="ml-4 mr-4 focus:outline-none bg-transparent w-[300px] sm:min-w-[300px] max-w-[calc(100%-92px)] sm:w-full text-lg placeholder-[#716e74] text-white text-opacity-80"
                                    placeholder="Custom deadline..."
                                />
                                <span className="hidden text-lg text-white md:block opacity-30">mins</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm font-[400] text-white">Options</div>
                    <div className="flex items-center justify-between w-full">
                        <label className="flex items-center mr-4 text-white" id="headlessui-label-17">Show withdrawal address
                            <div className="inline-block" onMouseOver={() => setShowAddressTitle(true)} onMouseLeave={() => setShowAddressTitle(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-4 h-4 ml-1 cursor-pointer text-[#252027] fill-bgLighter">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>

                            <div className="overflow-visible">
                                <div className={`absolute bg-black border-0 mt-3 z-50 font-normal leading-normal text-sm max-w-xs text-left no-underline break-words rounded-lg  ${!showAddressTitle ? 'hidden' : ''}`}>
                                    <div>
                                        <div className="p-3 font-[400] text-white">Allows bridging to another address.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>

                        <button className={`bg-gradient-to-r from-[#FF00FF] to-[#AC8FFF] relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${showAddress ? "from-[#FF00FF] to-[#AC8FFF]" : "from-gray-900 to-gray-900"}`} id="headlessui-switch-18" role="switch" type="button" aria-checked="false" aria-labelledby="headlessui-label-17" onClick={() => setShowAddress(!showAddress)}>
                            <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${showAddress ? "translate-x-6" : "translate-x-1"}`}></span>
                        </button>
                    </div>

                    {
                        showAddress &&
                        <div className="w-full p-4 bg-bgLight rounded-xl">
                            <div className="flex items-center justify-between space-x-1">
                                <div className="w-3/4 text-xs text-white md:text-sm">Do not send your funds to a custodial wallet or exchange address!
                                    <span className="text-white text-opacity-50">It may be impossible to recover your funds.</span>
                                </div>

                                <button className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none transition-all duration-100 transform-gpu p-4 rounded-xl text-sm font-medium text-white bg-bgLighter hover:bg-bgLightest active:bg-bgLightest" onClick={collapse}>Okay!</button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}