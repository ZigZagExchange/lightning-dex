import { useEffect, useState } from "react";
import { ethers } from "ethers";

function ProvideLiquidity() {
  const [address, setAddress] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  useEffect(() => {
    setIsAddressValid(ethers.utils.isAddress(address));
  }, [address]);

  const handleButtonPress = () => {
    setIsLoading(true);
    fetch(
      `https://api.zap.zigzag.exchange/get-btc-lp-deposit-address?outgoing_address=${address}`
    )
      .then((res) => res.json())
      .then((res) => {
        setDepositAddress(res.deposit_address);
      })
      .catch(() => {
        alert("Error generating address");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="h-16 pb-4 mt-7 space-x-2 text-left">
        <div className="h-14 flex flex-grow items-center bg-transparent border border-white border-opacity-20 hover:border-bgLightest focus-within:border-bgLightest pl-3 pr-2 sm:pl-4 py-0.5 rounded-xl">
          <input
            className="focus:outline-none bg-transparent w-[300px] sm:min-w-[300px] sm:w-full text-white text-opacity-80 text-md placeholder:text-[#88818C] z-10"
            value={address}
            placeholder={`Enter ETH address`}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>
      {depositAddress ? (
        <div className="origin-top mt-4">
          <div>
            <p>
              Send BTC to this deposit address. Your LP tokens will be minted to
              your ETH address when your transaction confirms.
            </p>
            <div className="w-[30%] mt-8">
              <div className="flex items-center justify-center  h-[26px] -mt-4 p-2 absolute text-sm text-[#D8D1DC] rounded-md bg-bgLight">
                Deposit Address
              </div>
            </div>

            <div className="h-16 pb-4 mt-4 space-x-2 text-left">
              <div className="h-14 flex flex-grow items-center bg-transparent border border-white border-opacity-20 hover:border-bgLightest focus-within:border-bgLightest pl-3 pr-2 sm:pl-4 py-0.5 rounded-xl">
                <h4 className="opacity-90">{depositAddress}</h4>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 -mt-2 md:py-4">
          <button
            className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false"
            disabled={!isAddressValid || isLoading}
            type="button"
            onClick={handleButtonPress}
          >
            {!isAddressValid
              ? "Enter a valid ETH address"
              : isLoading
              ? "Generating deposit address ..."
              : "Deposit BTC"}
          </button>

          <div className="flex items-center justify-between mt-4">
            <div className="flex justify-between text-[#88818C]"></div>
            <div className="flex justify-between w-full">
              <div className="flex space-x-2 text-[#88818C]">
                <p>Exchange rate</p>
              </div>
              <span className="text-[#88818C] cursor-pointer">
                1 BTC = 1 ZBLP
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex justify-between text-[#88818C]"></div>
            <div className="flex justify-between w-full">
              <div className="flex space-x-2 text-[#88818C]">
                <p>Network fee</p>
              </div>
              <span className="text-[#88818C] cursor-pointer">~$30.71</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex justify-between text-[#88818C]"></div>
            <div className="flex justify-between w-full">
              <div className="flex space-x-2 text-[#88818C]">
                <p>Yeild</p>
              </div>
              <span className="text-[#88818C] cursor-pointer">6%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProvideLiquidity;
