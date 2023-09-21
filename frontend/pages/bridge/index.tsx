import React, { useEffect, useState } from "react";
import SelectNetwork from "./select-network";
import SelectAsset from "./select-asset";
import InputAmount from "./input-amount";
import { useBridge } from "../../hooks/use-bridge";
import { useBridgeApi } from "../../hooks/use-bridge-api";
import { useWallet } from "../../hooks/use-wallet";
import { Networks } from "../../contexts/wallet-context";

function BridgePage() {
  const {
    swapAssets,
    depositAsset,
    outgoingAsset,
    getCurrentDepositAsset,
    getCurrentOutgoingAsset,
    withdrawalAddress,
    setWithdrawalAddress,
    depositAmount,
    outgoingAmount,
    depositChain,
    outgoingChain,
    isLoading,
    bitcoinDepositAddress,
  } = useBridge();
  const { connectedWallet, connectToNetwork } = useWallet();
  const { calculateOutgoingAmount, getUsdPrice, hasSufficientLiquidity } =
    useBridgeApi();
  const [displayPrice, setDisplayPrice] = useState("loading ...");
  const [displayFee, setDisplayFee] = useState("loading ...");
  const [displayNetworkFee, setDisplayNetworkFee] = useState("loading ...");
  const [outgoingAssetName, setOutgoingAssetName] = useState<string>("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonLabel, setButtonLabel] = useState("Enter a valid amount");
  const [showAddressInput, setShowAddressInput] = useState(true);

  useEffect(() => {
    // set pricing and metadata
    const selectedDepositAsset = getCurrentDepositAsset();
    const selectedOutgoingAsset = getCurrentOutgoingAsset();
    const priceInOutgoing = calculateOutgoingAmount(
      selectedDepositAsset?.priceMapKey || "",
      selectedOutgoingAsset?.priceMapKey || "",
      1
    );
    setDisplayPrice(
      `1 ${selectedDepositAsset?.name} = ${priceInOutgoing.toFixed(4)} ${
        selectedOutgoingAsset?.name
      } (~$${getUsdPrice(selectedDepositAsset?.priceMapKey || "").toFixed(2)})`
    );
    setDisplayFee(selectedOutgoingAsset?.feeDisplay || "");
    setDisplayNetworkFee(selectedDepositAsset?.networkFeeDisplay || "");
    setOutgoingAssetName(selectedOutgoingAsset?.name || "");
    setShowAddressInput(selectedDepositAsset?.requiresAddressInput === true);

    // figure out current button state
    if (
      !depositAmount ||
      Number(depositAmount) === 0 ||
      isNaN(Number(depositAmount))
    ) {
      setIsButtonDisabled(true);
      setButtonLabel("Enter an valid amount");
    } else if (
      selectedDepositAsset?.requiresAddressInput &&
      !selectedOutgoingAsset?.validateAddress(withdrawalAddress)
    ) {
      setIsButtonDisabled(true);
      setButtonLabel("Enter a valid withdrawal address");
    } else if (
      !hasSufficientLiquidity(
        selectedOutgoingAsset?.availableLiquidityMapKey as string,
        Number(outgoingAmount)
      )
    ) {
      setIsButtonDisabled(true);
      setButtonLabel("Insufficient liquidity");
    } else if (
      selectedDepositAsset?.miniumDeposit &&
      Number(depositAmount) < selectedDepositAsset?.miniumDeposit
    ) {
      setIsButtonDisabled(true);
      setButtonLabel(`Min deposit is ${selectedDepositAsset?.miniumDeposit}`);
    } else if (
      selectedDepositAsset?.requiresConnectionTo &&
      connectedWallet?.network !== selectedDepositAsset.requiresConnectionTo
    ) {
      setIsButtonDisabled(false);
      setButtonLabel("Connect wallet");
    } else {
      setIsButtonDisabled(false);
      setButtonLabel("Bridge!");
    }
  }, [
    depositAsset,
    outgoingAsset,
    depositAmount,
    outgoingAmount,
    depositChain,
    outgoingChain,
    withdrawalAddress,
    connectedWallet?.network,
  ]);

  const handleButtonPress = () => {
    const selectedDepositAsset = getCurrentDepositAsset();
    if (
      selectedDepositAsset?.requiresConnectionTo &&
      connectedWallet?.network !== selectedDepositAsset.requiresConnectionTo
    ) {
      connectToNetwork(selectedDepositAsset?.requiresConnectionTo as Networks);
    } else {
      selectedDepositAsset?.deposit();
    }
  };

  return (
    <>
      <div className="pb-3 place-self-center">
        <div className="flex items-center justify-between mb-5 ml-5 mr-5 space-x-2">
          <div>
            <div className="text-2xl font-medium text-white">Bridge</div>

            <div className="text-base text-white text-opacity-50">
              Send your assets across chains.
            </div>
          </div>
        </div>
        <div className="pt-3 max-w-lg px-1 pb-1 -mb-3 rounded-xl bg-bgBase md:px-6 lg:px-6">
          <div className="mb-8">
            <div className="grid grid-cols-1 gap-4  place-content-center">
              <div className="pt-3 pb-3 pl-4 pr-4 mt-2 border-none bg-primary rounded-xl">
                <div className="flex items-center justify-center md:justify-between">
                  <div className="text-gray-400 text-sm undefined hidden md:block lg:block mr-2"></div>
                  <SelectNetwork direction="deposit" />
                </div>

                <div className="pt-2">
                  <div className="py-3 border-none bg-primary rounded-xl">
                    <div className="flex space-x-2">
                      <div className="flex flex-grow items-center pl-4 md:pl-2 w-full h-20 rounded-xl border border-white border-opacity-20 hover:border-opacity-30">
                        <SelectAsset direction="deposit" />
                        <InputAmount direction="deposit" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 pb-3 pl-4 pr-4 mt-4 border-none bg-primary rounded-xl">
                <div className="flex items-center justify-center md:justify-between">
                  <div className="mt-[-3rem]" onClick={swapAssets}>
                    <div className="rounded-full hover:cursor-pointer select-none">
                      <div className="group rounded-full inline-block p-2  bg-primary bg-opacity-80 transform-gpu transition-all duration-100 active:rotate-90">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                          className="w-6 h-6 transition-all text-white group-hover:text-opacity-50"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <SelectNetwork direction="outgoing" />
                </div>

                <div className="pt-2">
                  <div className="py-3 border-none bg-primary rounded-xl">
                    <div className="flex space-x-2">
                      <div className="flex flex-grow items-center pl-4 md:pl-2 w-full h-20 rounded-xl border border-white border-opacity-20 hover:border-opacity-30">
                        <SelectAsset direction="outgoing" />
                        <InputAmount direction="outgoing" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-3.5 px-1 space-y-2 text-xs md:text-base lg:text-base">
                  <div className="flex items-center justify-between">
                    <div className="flex justify-between text-[#88818C]"></div>
                    <div className="flex justify-between w-full">
                      <div className="flex space-x-2 text-[#88818C]">
                        <p>Price</p>
                      </div>
                      <span className="text-[#88818C] cursor-pointer">
                        {displayPrice}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex justify-between text-[#88818C]"></div>
                    <div className="flex justify-between w-full">
                      <div className="flex space-x-2 text-[#88818C]">
                        <p>Trading fee</p>
                      </div>
                      <span className="text-[#88818C] cursor-pointer">
                        {displayFee}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex justify-between text-[#88818C]"></div>
                    <div className="flex justify-between w-full">
                      <div className="flex space-x-2 text-[#88818C]">
                        <p>Network fee</p>
                      </div>
                      <span className="text-[#88818C] cursor-pointer">
                        {displayNetworkFee}
                      </span>
                    </div>
                  </div>

                  <div className="-mx-0 md:-mx-6">
                    {showAddressInput && (
                      <>
                        <div className="w-[30%]">
                          <div className="flex items-center justify-center h-[26px] -mt-4 p-2 absolute ml-5 md:ml-10 text-sm text-[#D8D1DC] rounded-md bg-bgLight">
                            Withdraw to...
                          </div>
                        </div>
                        <div className="h-16 px-2 pb-4 mt-7 space-x-2 text-left sm:px-5">
                          <div className="h-14 flex flex-grow items-center bg-transparent border border-white border-opacity-20 hover:border-bgLightest focus-within:border-bgLightest pl-3 pr-2 sm:pl-4 py-0.5 rounded-xl">
                            <input
                              className="focus:outline-none bg-transparent w-[300px] sm:min-w-[300px] sm:w-full text-white text-opacity-80 text-md placeholder:text-[#88818C] z-10"
                              value={withdrawalAddress}
                              placeholder={`Enter ${outgoingAssetName} address`}
                              onChange={(e) =>
                                setWithdrawalAddress(e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="px-2 py-2 -mt-2 md:px-0 md:py-4 mx-6">
                      <button
                        className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false"
                        disabled={isButtonDisabled || isLoading}
                        type="button"
                        onClick={handleButtonPress}
                      >
                        {isLoading ? "Bridge pending ..." : buttonLabel}
                      </button>
                    </div>

                    {bitcoinDepositAddress && (
                      <div className="origin-top -mx-0">
                        <div>
                          <p className="mx-6">
                            Send BTC to this deposit address. Your ETH will be
                            sent out when your transaction confirms.
                          </p>
                          <div className="w-[30%] mt-8">
                            <div className="flex items-center justify-center  h-[26px] -mt-4 p-2 absolute ml-5 md:ml-10 text-sm text-[#D8D1DC] rounded-md bg-bgLight">
                              Deposit Address
                            </div>
                          </div>

                          <div className="h-16 px-2 pb-4 mt-4 space-x-2 text-left sm:px-5">
                            <div className="h-14 flex flex-grow items-center bg-transparent border border-white border-opacity-20 hover:border-bgLightest focus-within:border-bgLightest pl-3 pr-2 sm:pl-4 py-0.5 rounded-xl">
                              {bitcoinDepositAddress}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BridgePage;
