import { useState, useContext, useMemo } from "react"

import styles from "./Swap.module.css"
import SellInput from "./sellInput/SellInput"
import BuyInput from "./buyInput/BuyInput"
import Modal, { ModalMode } from "./modal/Modal"
import TransactionSettings from "./transactionSettings/TransactionSettings"
import SwapButton from "./swapButton/SwapButton"
import NetworkSelector from "./networkSelector/NetworkSelector"
import TokenSelector from "./tokenSelector/TokenSelector"

import { ExchangeContext, ZZTokenInfo } from "../../contexts/ExchangeContext"
import { WalletContext } from "../../contexts/WalletContext"
import { SwapContext, ZZOrder } from "../../contexts/SwapContext"
import { prettyBalance, prettyBalanceUSD } from "../../utils/utils"
import { constants, ethers } from "ethers"
import Separator from "./separator/Separator"
import useTranslation from "next-translate/useTranslation"
import { NetworkType } from "../../data/networks"
import Image from "next/image"

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
  const [swapOrder, setSwapOrder] = useState<string>("order-0")

  const [modal, setModal] = useState<ModalMode>(null)

  const { t } = useTranslation("swap")

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

  return (
    <>
      <div className="pb-3 place-self-center">
        <div className="flex justify-between mb-5 ml-5 mr-5">
          <div>
            <div className="text-2xl font-medium text-white">Swap</div>
            <div className="text-base text-white text-opacity-50">Exchange stablecoins on-chain.
            </div>
          </div>
        </div>

        <div className="pt-3 max-w-lg px-1 pb-0 -mb-3 transition-all duration-100 transform rounded-xl bg-bgBase md:px-6 lg:px-6">
          <div className="mb-8">
            <NetworkSelector count={showNetworkSelector} />
            <TokenSelector count={firstCount} />
            <TokenSelector count={secondCount} />

            <div className="grid grid-cols-1 gap-4  place-content-center">
              <div className="pt-3 pb-3 pl-4 pr-4 mt-2 border-none bg-primary rounded-xl">
                <div className="flex items-center justify-center md:justify-between">
                  <div className="text-gray-400 text-sm undefined hidden md:block lg:block mr-2">Chain</div>

                  <div className="flex items-center space-x-4 md:space-x-3">
                    <div className="px-1 flex items-center bg-primary text-white border border-[#5170ad] dark:border-[#5170ad] rounded-full">
                      <Image src="/tokenIcons/eth.svg" alt="ether" width={22} height={22} className="w-5 h-5 my-1 mr-0 rounded-full md:mr-1 opacity-80" />
                      <div className="hidden md:inline-block lg:inline-block">
                        <div className="mr-2 text-sm text-white">Ethereum</div>
                      </div>
                    </div>

                    <button className="flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full" onClick={() => { setModal("connectWallet") }}>
                      <div className="inline-block">
                        <Image src="/tokenIcons/abt.jfif" width={22} height={22} className="duration-300 rounded-full hover:scale-125" alt="Arbitrum" />
                      </div>

                      <div className="overflow-visible">
                        <div className="bg-black border-0 mt-3 z-50 font-normal leading-normal text-sm max-w-xs text-left  no-underline break-words rounded-lg hidden" data-popper-placement="bottom">
                          <div>
                            <div className="p-3 font-light text-white">
                              Arbitrum
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button className="flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full" onClick={() => { setModal("connectWallet") }}>
                      <div className="inline-block">
                        <Image src="/tokenIcons/avax.svg" width={22} height={22} className="duration-300 rounded-full hover:scale-125" alt="Avalanche" />
                      </div>

                      <div className="overflow-visible">
                        <div className="bg-black border-0 mt-3 z-50 font-normal leading-normal text-sm max-w-xs text-left  no-underline break-words rounded-lg hidden" data-popper-placement="bottom">
                          <div>
                            <div className="p-3 font-light text-white">
                              Avalanche
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button className="flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full" onClick={() => { setModal("connectWallet") }}>
                      <div className="inline-block">
                        <Image src="/tokenIcons/bnb.svg" width={22} height={22} className="duration-300 rounded-full hover:scale-125" alt="BNB Chain" />
                      </div>

                      <div className="overflow-visible">
                        <div className="bg-black border-0 mt-3 z-50 font-normal leading-normal text-sm max-w-xs text-left  no-underline break-words rounded-lg hidden" data-popper-placement="bottom">
                          <div>
                            <div className="p-3 font-light text-white">
                              BNB Chain
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button className="flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full" onClick={() => { setModal("connectWallet") }}>
                      <div className="inline-block">
                        <Image src="/tokenIcons/opt.png" width={22} height={22} className="duration-300 rounded-full hover:scale-125" alt="Optimism" />
                      </div>

                      <div className="overflow-visible">
                        <div className="bg-black border-0 mt-3 z-50 font-normal leading-normal text-sm max-w-xs text-left  no-underline break-words rounded-lg hidden" data-popper-placement="bottom">
                          <div>
                            <div className="p-3 font-light text-white">
                              Optimism
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button className="flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full" onClick={() => { setModal("connectWallet") }}>
                      <div className="inline-block">
                        <Image src="/tokenIcons/pol.jfif" width={22} height={22} className="duration-300 rounded-full hover:scale-125" alt="Polygon" />
                      </div>

                      <div className="overflow-visible">
                        <div className="bg-blackborder-0 mt-3 z-50 font-normal leading-normaltext-sm max-w-xs text-left o-underline  break-words rounded-lg hidden" data-popper-placement="bottom">
                          <div>
                            <div className="p-3 font-light text-white">
                              Polygon
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    <button className="w-8 h-8 px-1.5 py-1.5 bg-[#C4C4C4] bg-opacity-10 rounded-full hover:cursor-pointer group" onClick={() => setShowNetworkSelector(showNetworkSelector + 1)}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="text-gray-300 transition transform-gpu group-hover:opacity-50 group-active:rotate-180">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 relative place-content-center">
                <div className={`pt-2 ${swapOrder}`}>
                  <div></div>
                  <div className="p-3 border-none bg-primary rounded-xl">
                    <div className="flex space-x-2">
                      <div className="flex flex-grow items-center pl-4 md:pl-2 w-full h-20 rounded-xl border border-white border-opacity-20 hover:border-opacity-30">
                        <button className="sm:mt-[-1px] flex-shrink-0 mr-[-1px] w-[35%]">
                          <div className="group rounded-xl  border border-transparent transform-gpu transition-all duration-125 hover:bg-orange-100 dark:hover:bg-opacity-20 dark:hover:bg-orange-700  hover:border-orange-300" onClick={() => setFirstCount(firstCount + 1)}>
                            <div className="flex justify-center md:justify-start bg-white bg-opacity-10 items-center rounded-lg py-1.5 pl-2 cursor-pointer h-14">
                              <div className="self-center flex-shrink-0 hidden mr-1 sm:block">
                                <div className="relative flex p-1 rounded-full">
                                  <Image alt="dai" src="/tokenIcons/dai.svg" width={28} height={28} />
                                </div>
                              </div>

                              <div className="text-left cursor-pointer">
                                <h4 className="text-lg font-medium text-gray-300 ">
                                  <span>DAI</span>

                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="inline w-4 ml-2 -mt-1 transition-all transform focus:rotate-180">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                  </svg>
                                </h4>
                              </div>
                            </div>
                          </div>
                        </button>

                        <div className="flex flex-grow items-center w-full h-16 border-none">
                          <input type="number" className="ml-4 -mt-0 focus:outline-none bg-transparent pr-4 w-5/6 placeholder:text-[#88818C]  text-white text-opacity-80 text-lg md:text-2xl lg:text-2xl font-medium" placeholder="0.0000" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute mt-1 ml-2 top-[8.5rem]" onClick={() => setSwapOrder(v => v === "order-1" ? "order-0" : "order-1")}>
                  <div className="-mt-8">
                    <div className="rounded-full p-2 -mr-2 -ml-2 hover:cursor-pointer select-none">
                      <div className="group rounded-full inline-block p-2  bg-primary bg-opacity-80 transform-gpu transition-all duration-100 active:rotate-90">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="w-6 h-6 transition-all text-white group-hover:text-opacity-50">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-3 border-none bg-primary rounded-xl">
                    <div className="flex space-x-2">
                      <div className="flex flex-grow items-center pl-4 md:pl-2 w-full h-20 rounded-xl border border-white border-opacity-20 hover:border-opacity-30">
                        <button className="sm:mt-[-1px] flex-shrink-0 mr-[-1px] w-[35%]">
                          <div className="group rounded-xl  border border-transparent transform-gpu transition-all duration-125 hover:bg-blue-100 dark:hover:bg-opacity-20 dark:hover:bg-blue-700  hover:border-blue-300" onClick={() => setSecondCount(secondCount + 1)}>
                            <div className="flex justify-center md:justify-start bg-white bg-opacity-10 items-center rounded-lg py-1.5 pl-2 cursor-pointer h-14">
                              <div className="self-center flex-shrink-0 hidden mr-1 sm:block">
                                <div className="relative flex p-1 rounded-full">
                                  <Image alt="usdc" width={40} height={40} className="w-7 h-7" src="/tokenIcons/usdc.svg" />
                                </div>
                              </div>

                              <div className="text-left cursor-pointer">
                                <h4 className="text-lg font-medium text-gray-300 ">
                                  <span>USDC</span>
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
            </div>

            <div className="py-3.5 px-1 space-y-2 text-xs md:text-base lg:text-base">
              <div className="flex justify-end"></div>
              <div className="flex justify-between">
                <div className="flex space-x-2 text-[#88818C]">
                  <p>Expected Price on</p>
                  <span className="flex items-center space-x-1">

                    <Image alt="ethereum" width={16} height={16} src="/tokenIcons/eth.svg" className="w-4 h-4 rounded-full" />
                    <span className="text-white">Ethereum
                    </span></span>
                </div>

                <span className="text-[#88818C]">—</span>
              </div>

              <div className="flex justify-between">
                <p className="text-[#88818C] ">Slippage</p>
                <span className="text-[#88818C]">—</span>
              </div>
            </div>

            <div className="px-2 py-2 md:px-0 md:py-4">
              <button className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false" disabled type="button">
                <span>Enter amount to swap</span>
              </button>
            </div>
          </div>
        </div >
      </div >

      <Modal selectedModal={modal} onTokenClick={(tokenAddress: string) => handleTokenClick(tokenAddress)} close={() => setModal(null)} />
    </>
  )
}

export default Swap

function ExplorerButton({ network, token }: { network: NetworkType | null; token: ZZTokenInfo | null }) {
  const { t } = useTranslation("common")

  if (network && token) {
    if (token.address === constants.AddressZero) {
      return <a className={styles.native_token}>{t("native_token")}</a>
    }
    return (
      <a className={styles.see_in_explorer_link} href={`${network.explorerUrl}/token/${token.address}`} target="_blank" rel="noopener noreferrer">
        {t("view_in_explorer")}
      </a>
    )
  } else return null
}
