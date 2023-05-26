import { useState, useContext, useMemo, useEffect } from "react"
import { ethers } from "ethers"
import Image from "next/image"
import { useSwitchNetwork, useNetwork, useAccount } from 'wagmi'
import useTranslation from "next-translate/useTranslation"

import styles from "./Bridge.module.css"
import Modal, { ModalMode } from "./modal/Modal"
// import NetworkSelector from "./networkSelector/NetworkSelector"
import TokenSelector from "./tokenSelector/TokenSelector"
import SettingsDropdown from "./settingsDropdown/SettingsDropdown"

import { ExchangeContext, ZZTokenInfo } from "../../contexts/ExchangeContext"
import { WalletContext } from "../../contexts/WalletContext"
import { SwapContext, ZZOrder } from "../../contexts/SwapContext"
import { prettyBalance, prettyBalanceUSD } from "../../utils/utils"
import { networksItems } from "../../utils/data"
import { useAtom } from "jotai"
import { destTokenAtom, originTokenAtom } from "../../store/token"

export enum SellValidationState {
  OK,
  IsNaN,
  IsNegative,
  InsufficientBalance,
  ExceedsAllowance,
  InternalError,
  MissingLiquidity,
}

export enum BuyValidationState {
  OK,
  InternalError,
}

function Swap() {
  const { network, userAddress } = useContext(WalletContext)
  const { allowances, balances, buyTokenInfo, sellTokenInfo, tokenPricesUSD } = useContext(ExchangeContext)
  const { sellAmount, buyAmount, swapPrice, quoteOrderRoutingArray, selectSellToken, selectBuyToken } = useContext(SwapContext)
  const [showNetworkSelector, setShowNetworkSelector] = useState(0)
  const [firstCount, setFirstCount] = useState(0)
  const [secondCount, setSecondCount] = useState(0)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [swapOrder, setSwapOrder] = useState<string>("order-0")
  const { address, isConnected } = useAccount()
  const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  const [actionType, setActionType] = useState("set-origin")
  const { chain } = useNetwork()
  const [originNetworkID, setOriginNetworkID] = useState(1)
  const [destNetworkID, setDestNetworkID] = useState(42161)
  const [originToken, setOriginTokenAtom] = useAtom(originTokenAtom)
  const [destToken, setDestTokenAtom] = useAtom(destTokenAtom)


  const [modal, setModal] = useState<ModalMode>(null)

  const { t } = useTranslation("swap")

  useEffect(() => {
    const origin = chain && chain.id ? chain.id : 1
    const dest = origin === 1 ? 42161 : 1
    setOriginNetworkID(origin)
    setDestNetworkID(dest)
  }, [])

  useEffect(() => {
    const id = chain ? chain.id : 1

    if (actionType === "set-origin") {
      if (id === destNetworkID) {
        setDestNetworkID(originNetworkID)
      }
    }

    if (actionType === "set-dest") {
      setDestNetworkID(originNetworkID)
    }

    if (actionType === "swap") {
      setDestNetworkID(originNetworkID)
    }

    setOriginNetworkID(id)
    setActionType("")
  }, [chain])

  const getBalanceReadable = (tokenAddress: string | null) => {
    if (tokenAddress === null) return "0.0"
    const tokenBalance = balances[tokenAddress]
    if (tokenBalance === undefined) return "0.0"
    return prettyBalance(tokenBalance.valueReadable)
  }

  const validationStateSell = useMemo((): SellValidationState => {
    if (!userAddress) return SellValidationState.OK
    if (!sellTokenInfo) return SellValidationState.InternalError
    if (!swapPrice) return SellValidationState.MissingLiquidity

    const firstQuoteOrder: ZZOrder | undefined = quoteOrderRoutingArray[0]
    if (!firstQuoteOrder || sellAmount.gt(firstQuoteOrder.order.buyAmount)) {
      return SellValidationState.MissingLiquidity
    }

    const sellTokenBalance = balances[sellTokenInfo.address]
    const balance = sellTokenBalance ? sellTokenBalance.value : ethers.constants.Zero
    if (balance === null) return SellValidationState.InsufficientBalance
    if (sellAmount.gt(balance)) return SellValidationState.InsufficientBalance

    const allowance = allowances[sellTokenInfo.address] ? allowances[sellTokenInfo.address] : ethers.constants.Zero
    if (allowance !== null && allowance !== undefined && sellAmount.gt(allowance)) {
      return SellValidationState.ExceedsAllowance
    }

    return SellValidationState.OK
  }, [userAddress, swapPrice, sellAmount, allowances, balances, sellTokenInfo])

  const validationStateBuy = useMemo((): BuyValidationState => {
    if (!userAddress) return BuyValidationState.OK
    if (!buyTokenInfo) return BuyValidationState.InternalError

    return BuyValidationState.OK
  }, [userAddress, buyTokenInfo])

  const handleTokenClick = (newTokenAddress: string) => {
    if (modal === "selectSellToken") {
      selectSellToken(newTokenAddress)
    } else if (modal === "selectBuyToken") {
      selectBuyToken(newTokenAddress)
    }
    setModal(null)
  }

  const sellTokenUsdPrice = sellTokenInfo ? tokenPricesUSD[sellTokenInfo.address] : undefined
  const buyTokenUsdPrice = buyTokenInfo ? tokenPricesUSD[buyTokenInfo.address] : undefined

  // Estimated sell token value
  const sellTokenEstimatedValue = useMemo(() => {
    if (sellTokenUsdPrice !== undefined) {
      if (!sellTokenInfo) return
      const sellAmountFormated = Number(ethers.utils.formatUnits(sellAmount, sellTokenInfo.decimals))
      if (sellAmountFormated === 0) return
      return <div className={styles.estimated_value}>{`~$${prettyBalanceUSD(sellAmountFormated * sellTokenUsdPrice)}`}</div>
    }
  }, [sellTokenInfo, sellAmount, sellTokenUsdPrice])

  // Estimated buy token value
  const buyTokenEstimatedValue = useMemo(() => {
    if (!buyTokenInfo) return
    if (buyTokenUsdPrice !== undefined) {
      const buyAmountFormated = Number(ethers.utils.formatUnits(buyAmount, buyTokenInfo.decimals))
      if (buyAmountFormated === 0) return

      const buyTokenValue = buyAmountFormated * buyTokenUsdPrice
      let percent
      if (sellTokenUsdPrice !== undefined) {
        if (!sellTokenInfo) return
        const sellAmountFormated = Number(ethers.utils.formatUnits(sellAmount, sellTokenInfo.decimals))
        if (sellAmountFormated === 0) {
          return <div className={styles.estimated_value}>{`~$${prettyBalanceUSD(buyTokenValue)}`}</div>
        }
        const sellTokenValue = sellAmountFormated * sellTokenUsdPrice
        percent = `(${prettyBalanceUSD((buyTokenValue - sellTokenValue) * 100 / sellTokenValue)}%)`
      }
      return <div className={styles.estimated_value}>{`~$${prettyBalanceUSD(buyTokenValue)} ${percent}`}</div>
    }
    return
  }, [sellTokenInfo, buyTokenInfo, sellAmount, buyAmount, sellTokenUsdPrice, buyTokenUsdPrice])

  // Switch network
  const onSwitchNetwork = (id: number) => {
    if (isConnected) {
      switchNetwork?.(id)
    } else {
      setModal("connectWallet")
    }
  }

  const changeOriginNetworkID = (id: number) => {
    onSwitchNetwork(id)
    setActionType("set-origin")
  }

  const changeDestNetworkID = (id: number) => {
    if (id === originNetworkID) {
      switchNetwork?.(destNetworkID)
      setActionType("set-dest")
    } else {
      setDestNetworkID(id)
    }
  }

  const swapNetwork = () => {
    switchNetwork?.(destNetworkID)
    setActionType("swap")
  }

  const setOriginToken = (val: any) => {
    setOriginTokenAtom(val)
  }

  const setDestToken = (val: any) => {
    setDestTokenAtom(val)
  }

  return (
    <>
      <div className="pb-3 place-self-center">
        {
          !showSettings ?
            <div className="flex items-center justify-between mb-5 ml-5 mr-5 space-x-2">
              <div>
                <div className="text-2xl font-medium text-white">Bridge</div>

                <div className="text-base text-white text-opacity-50">Send your assets across chains.</div>
              </div>
              <div>

                <button
                  className="group cursor-pointer rounded-lg outline-none focus:outline-none active:outline-none ring-none transition-all duration-100 transform-gpu flex items-center p-3 text-opacity-75 bg-bgLight hover:bg-bgLighter text-secondaryTextColor hover:text-white"
                  onClick={() => setShowSettings(true)}
                >
                  <svg viewBox="0 0 19 19" fill="none" className="w-5 h-5 mr-2">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.2135 1.64549C10.7765 -0.148512 8.22351 -0.148512 7.78651 1.64549C7.72126 1.91507 7.59329 2.16543 7.41301 2.37621C7.23273 2.58699 7.00523 2.75223 6.74903 2.85847C6.49282 2.96472 6.21515 3.00898 5.93861 2.98764C5.66207 2.9663 5.39448 2.87998 5.15761 2.73569C3.57981 1.77429 1.77431 3.57979 2.73571 5.15759C3.35671 6.17649 2.80586 7.50589 1.64666 7.78764C-0.148494 8.22349 -0.148494 10.7776 1.64666 11.2123C1.91631 11.2777 2.16671 11.4058 2.37749 11.5862C2.58827 11.7666 2.75346 11.9942 2.85961 12.2506C2.96575 12.5069 3.00986 12.7847 2.98833 13.0613C2.96679 13.3379 2.88024 13.6056 2.73571 13.8424C1.77431 15.4202 3.57981 17.2257 5.15761 16.2643C5.39444 16.1198 5.66205 16.0332 5.93867 16.0117C6.21528 15.9901 6.49307 16.0342 6.74941 16.1404C7.00575 16.2465 7.2334 16.4117 7.41382 16.6225C7.59424 16.8333 7.72233 17.0837 7.78766 17.3533C8.22351 19.1485 10.7777 19.1485 11.2124 17.3533C11.2779 17.0838 11.4061 16.8336 11.5866 16.623C11.767 16.4123 11.9946 16.2472 12.2509 16.1411C12.5072 16.035 12.7849 15.9909 13.0614 16.0123C13.3379 16.0337 13.6055 16.12 13.8424 16.2643C15.4202 17.2257 17.2257 15.4202 16.2643 13.8424C16.12 13.6055 16.0337 13.3379 16.0123 13.0614C15.9909 12.7848 16.035 12.5072 16.1411 12.2509C16.2473 11.9946 16.4123 11.767 16.623 11.5866C16.8336 11.4061 17.0838 11.2779 17.3534 11.2123C19.1485 10.7765 19.1485 8.22234 17.3534 7.78764C17.0837 7.72231 16.8333 7.59423 16.6225 7.41381C16.4117 7.23339 16.2466 7.00574 16.1404 6.74939C16.0343 6.49305 15.9902 6.21526 16.0117 5.93865C16.0332 5.66204 16.1198 5.39442 16.2643 5.15759C17.2257 3.57979 15.4202 1.77429 13.8424 2.73569C13.6056 2.88022 13.338 2.96678 13.0613 2.98831C12.7847 3.00984 12.5069 2.96573 12.2506 2.85959C11.9943 2.75344 11.7666 2.58825 11.5862 2.37748C11.4058 2.1667 11.2777 1.91629 11.2124 1.64664L11.2135 1.64549ZM9.50001 12.95C10.415 12.95 11.2925 12.5865 11.9395 11.9395C12.5865 11.2925 12.95 10.415 12.95 9.49999C12.95 8.58499 12.5865 7.70747 11.9395 7.06047C11.2925 6.41347 10.415 6.04999 9.50001 6.04999C8.58501 6.04999 7.70749 6.41347 7.06049 7.06047C6.41349 7.70747 6.05001 8.58499 6.05001 9.49999C6.05001 10.415 6.41349 11.2925 7.06049 11.9395C7.70749 12.5865 8.58501 12.95 9.50001 12.95V12.95Z"
                      fill="currentColor"
                    />
                  </svg>

                  <span>Settings</span>
                </button>
              </div>
            </div>
            :
            <div className="flex items-center justify-between mb-5 ml-5 mr-5 space-x-2">
              <div>
                <div className="text-2xl font-medium text-white">Settings</div>

                <div className="text-base text-white text-opacity-50">Customize your experience.
                </div>
              </div>
              <div>
                <button className="group cursor-pointer rounded-lg outline-none focus:outline-none active:outline-none ring-none transition-all duration-100 transform-gpu flex items-center p-3 text-opacity-75 bg-bgLight hover:bg-bgLighter text-secondaryTextColor hover:text-white" onClick={() => { setShowSettings(false) }}>
                  <span>Close</span>
                </button>
              </div>
            </div>
        }

        <div className="pt-3 max-w-lg px-1 pb-0 -mb-3 transition-all duration-100 transform rounded-xl bg-bgBase md:px-6 lg:px-6">
          <div className="mb-8">
            {/* <NetworkSelector count={showNetworkSelector} /> */}
            <TokenSelector
              count={firstCount}
              onSelect={setOriginToken}
              key="token-selector-1"
            />
            <TokenSelector
              count={secondCount}
              onSelect={setDestToken}
              key="token-selector-2"
            />
            <SettingsDropdown show={showSettings} onClick={(val) => setShowSettings(val)} />

            <div className="grid grid-cols-1 gap-4  place-content-center">
              <div className="pt-3 pb-3 pl-4 pr-4 mt-2 border-none bg-primary rounded-xl">
                <div className="flex items-center justify-center md:justify-between">
                  <div className="text-gray-400 text-sm undefined hidden md:block lg:block mr-2">Origin</div>

                  <div className="flex items-center space-x-4 md:space-x-3">
                    {networksItems.map((item: any) =>
                      item.id === originNetworkID ?
                        <div
                          className="px-1 flex items-center bg-primary text-white border border-[#5170ad] dark:border-[#5170ad] rounded-full"
                          key={`${item.name}-${item.token}-active`}
                        >
                          <Image
                            src={`/tokenIcons/${item.icon}`}
                            alt="ether"
                            width={22}
                            height={22}
                            className="w-5 h-5 my-1 mr-0 rounded-full md:mr-1 opacity-80"
                          />
                          <div className="hidden md:inline-block lg:inline-block">
                            <div className="mr-2 text-sm text-white">{item.name}</div>
                          </div>
                        </div>
                        :
                        <button
                          className="relative token-item flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full"
                          key={`${item.name}-${item.token}`}
                          onClick={() => changeOriginNetworkID(item.id)}
                        >
                          <div className="inline-block">
                            <Image
                              src={`/tokenIcons/${item.icon}`}
                              width={22}
                              height={22}
                              className="duration-300 rounded-full hover:scale-125"
                              alt={item.name}
                            />
                          </div>

                          <div className="absolute overflow-visible top-[2.5rem] z-[2]">
                            <div
                              className="bg-black border-0 z-50 font-normal leading-normal text-sm max-w-xs text-left  no-underline break-words rounded-lg hidden"
                              data-popper-placement="bottom"
                            >
                              <div>
                                <div className="p-3 text-white">
                                  {item.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                    )}
                  </div>
                </div>

                <div className={`pt-2 ${swapOrder}`}>
                  <div className="py-3 border-none bg-primary rounded-xl">
                    <div className="flex space-x-2">
                      <div className="flex flex-grow items-center pl-4 md:pl-2 w-full h-20 rounded-xl border border-white border-opacity-20 hover:border-opacity-30">
                        <button className="sm:mt-[-1px] flex-shrink-0 mr-[-1px] w-[35%]">
                          <div
                            className="group rounded-xl  border border-transparent transform-gpu transition-all duration-125 hover:bg-blue-100 dark:hover:bg-opacity-20 dark:hover:bg-blue-700  hover:border-blue-300"
                            onClick={() => setFirstCount(v => v + 1)}
                          >
                            <div className="flex justify-center md:justify-start bg-white bg-opacity-10 items-center rounded-lg py-1.5 pl-2 cursor-pointer h-14">
                              <div className="self-center flex-shrink-0 hidden mr-1 sm:block">
                                <div className="relative flex p-1 rounded-full">
                                  <Image alt={originToken.name} width={40} height={40} className="w-7 h-7" src={`/tokenIcons/${originToken.icon}`} />
                                </div>
                              </div>

                              <div className="text-left cursor-pointer">
                                <h4 className="text-lg font-medium text-gray-300 ">
                                  <span>{originToken.name}</span>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="inline w-4 ml-2 -mt-1 transition-all transform focus:rotate-180">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </h4>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="flex flex-grow items-center w-full h-16 border-none">
                          <input pattern="[0-9.]+" className="ml-4 -mt-0 focus:outline-none bg-transparent pr-4 w-5/6
                placeholder:text-[#88818C]  text-white text-opacity-80 text-lg md:text-2xl lg:text-2xl font-medium" placeholder="0.0000" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute mt-1 ml-2 top-[11.2rem]" onClick={swapNetwork}>
                <div className="rounded-full p-2 -mr-2 -ml-2 hover:cursor-pointer select-none">
                  <div className="group rounded-full inline-block p-2  bg-primary bg-opacity-80 transform-gpu transition-all duration-100 active:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-6 h-6 transition-all text-white group-hover:text-opacity-50">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pt-3 pb-3 pl-4 pr-4 mt-2 border-none bg-primary rounded-xl">
                <div className="flex items-center justify-center md:justify-between">
                  <div className="text-gray-400 text-sm undefined hidden md:block lg:block mr-2">Dest.</div>

                  <div className="flex items-center space-x-4 md:space-x-3">
                    {networksItems.map((item: any) =>
                      item.id === destNetworkID ?
                        <div
                          className="px-1 flex items-center bg-primary text-white border border-[#5170ad] dark:border-[#5170ad] rounded-full"
                          key={`${item.name}-${item.token}`}
                        >
                          <Image src={`/tokenIcons/${item.icon}`} alt="ether" width={22} height={22} className="w-5 h-5 my-1 mr-0 rounded-full md:mr-1 opacity-80" />
                          <div className="hidden md:inline-block lg:inline-block">
                            <div className="mr-2 text-sm text-white">{item.name}</div>
                          </div>
                        </div>
                        :
                        <button
                          className="relative token-item flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full"
                          key={`${item.name}-${item.token}`}
                          onClick={() => changeDestNetworkID(item.id)}
                        >
                          <div className="inline-block">
                            <Image src={`/tokenIcons/${item.icon}`} width={22} height={22} className="duration-300 rounded-full hover:scale-125" alt={item.name} />
                          </div>

                          <div className="absolute overflow-visible top-[2.5rem] z-[2]">
                            <div className="bg-black border-0 z-50 font-normal leading-normal text-sm max-w-xs text-left  no-underline break-words rounded-lg hidden" data-popper-placement="bottom">
                              <div>
                                <div className="p-3 text-white">
                                  {item.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                    )}
                  </div>
                </div>

                <div className="py-3">
                  <div className="flex space-x-2">
                    <div className="flex flex-grow items-center pl-4 md:pl-2 w-full h-20 rounded-xl border border-white border-opacity-20 hover:border-opacity-30">
                      <button className="sm:mt-[-1px] flex-shrink-0 mr-[-1px] w-[35%]">
                        <div
                          className="group rounded-xl  border border-transparent transform-gpu transition-all duration-125 hover:bg-blue-100 dark:hover:bg-opacity-20 dark:hover:bg-blue-700  hover:border-blue-300"
                          onClick={() => setSecondCount(v => v + 1)}
                        >
                          <div className="flex justify-center md:justify-start bg-white bg-opacity-10 items-center rounded-lg py-1.5 pl-2 cursor-pointer h-14">
                            <div className="self-center flex-shrink-0 hidden mr-1 sm:block">
                              <div className="relative flex p-1 rounded-full">
                                <Image alt={destToken.name} width={40} height={40} className="w-7 h-7" src={`/tokenIcons/${destToken.icon}`} />
                              </div>
                            </div>

                            <div className="text-left cursor-pointer">
                              <h4 className="text-lg font-medium text-gray-300 ">
                                <span>{destToken.name}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="inline w-4 ml-2 -mt-1 transition-all transform focus:rotate-180">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                              </h4>
                            </div>
                          </div>
                        </div>
                      </button>

                      <div className="flex flex-grow items-center w-full h-16 border-none">
                        <input pattern="[0-9.]+" className="ml-4 -mt-0 focus:outline-none bg-transparent pr-4 w-5/6
                placeholder:text-[#88818C]  text-white text-opacity-80 text-lg md:text-2xl lg:text-2xl font-medium" placeholder="0.0000" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-3.5 px-1 space-y-2 text-xs md:text-base lg:text-base">
              <div className="flex items-center justify-between">
                <div className="flex justify-between text-[#88818C]">
                  <span className="text-[#88818C]">Will also receive 0.0006 </span>
                  <span className="ml-1 font-medium text-white">ETH
                    <span className="text-[#88818C] font-normal"> ($1.10)</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex space-x-2 text-[#88818C]">
                  <p>Expected Price on</p>
                  <span className="flex items-center space-x-1">
                    <Image alt="arbitrium" src="/tokenIcons/abt.jfif" width={16} height={16} className="w-4 h-4 rounded-full" />
                    <span className="text-white">Arbitrum</span>
                  </span>
                </div>

                <span className="text-[#88818C]">—</span>
              </div>
              <div className="flex justify-between">

                <p className="text-[#88818C] ">Slippage</p>
                <span className="text-[#88818C]">—</span>
              </div>
            </div>

            <div
              className="origin-top -mx-0 md:-mx-6">
              <div>
                <div className="w-[30%]">
                  <div className="flex items-center justify-center  h-[26px] -mt-4 p-2 absolute ml-5 md:ml-10 text-sm text-[#D8D1DC] rounded-md bg-bgLight">Withdraw to...</div>
                </div>

                <div className="h-16 px-2 pb-4 mt-4 space-x-2 text-left sm:px-5">
                  <div className="h-14 flex flex-grow items-center bg-transparent border border-bgLight hover:border-bgLightest focus-within:border-bgLightest pl-3 sm:pl-4 py-0.5 rounded-xl">
                    <input className="focus:outline-none bg-transparent w-[300px] sm:min-w-[300px] max-w-[calc(100%-92px)] sm:w-full text-white text-opacity-80 text-xl placeholder:text-[#88818C]" placeholder="Enter Arbitrum address..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-2 py-2 -mt-2 md:px-0 md:py-4">
              <button className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false" disabled type="button">
                <span>Invalid Destination Address</span>
              </button>
            </div>
          </div>
        </div >

        <div className="flex-wrap items-center justify-between ml-5 mr-5 text-[15px] md:flex lg:flex">
          <div className="flex items-center text-secondaryTextColor">
            <span className="mr-1 opacity-50">Need help? Read </span>

            <a href="#" className="">

              <span className="transition-all duration-75 cursor-pointer hover:text-opacity-100 hover:text-white transform-gpu">this guide </span></a>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </div>

          <a href="#">
            <div className="flex items-center text-opacity-50 transition-all duration-75 text-secondaryTextColor hover:text-opacity-100 hover:text-white transform-gpu ">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span className="cursor-pointer">Explorer</span>
            </div>
          </a>
        </div>
      </div >

      <Modal selectedModal={modal} onTokenClick={(tokenAddress: string) => handleTokenClick(tokenAddress)} close={() => setModal(null)} />
    </>
  )
}

export default Swap

// function ExplorerButton({ network, token }: { network: NetworkType | null; token: ZZTokenInfo | null }) {
//   const { t } = useTranslation("common")

//   if (network && token) {
//     if (token.address === constants.AddressZero) {
//       return <a className={styles.native_token}>{t("native_token")}</a>
//     }
//     return (
//       <a className={styles.see_in_explorer_link} href={`${network.explorerUrl}/token/${token.address}`} target="_blank" rel="noopener noreferrer">
//         {t("view_in_explorer")}
//       </a>
//     )
//   } else return null
// }
