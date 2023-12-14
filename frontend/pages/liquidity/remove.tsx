import { useEffect, useState } from "react";
import { Networks } from "../../contexts/wallet-context";
import { useWallet } from "../../hooks/use-wallet";
import { validate as validateBitcoinAddress } from "bitcoin-address-validation";
import { useDebounce } from "use-debounce";
import {
  useBalance,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { BTC_LP_CONTRACT_ABI, BTC_LP_CONTRACT_ADDRESS } from "../../data";
import { ethers } from "ethers";

function formatBalance(number: number) {
  const scaled = Math.floor(number * 10000) / 10000;
  return scaled.toFixed(4);
}

function RemoveLiquidity() {
  const { connectedWallet, connectToNetwork } = useWallet();
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [amount, setAmount] = useState("0");
  const balance = useBalance({
    address: connectedWallet?.address as `0x${string}`,
    token: BTC_LP_CONTRACT_ADDRESS,
    watch: true,
  });

  const debouncedWithdrawAddress = useDebounce(withdrawalAddress, 500);
  const prepareRemoveContractWrite = usePrepareContractWrite({
    address: BTC_LP_CONTRACT_ADDRESS,
    abi: BTC_LP_CONTRACT_ABI,
    functionName: "removeLiquidity",
    args: [
      ethers.utils.parseEther(amount === "" ? "0" : amount).toString(),
      debouncedWithdrawAddress[0],
    ],
  });
  const contractErrorMessage =
    // @ts-ignore
    prepareRemoveContractWrite?.error?.cause?.reason?.replace("ERC20: ", "");
  const removeContractWrite = useContractWrite(
    prepareRemoveContractWrite.config
  );
  const waitForRemove = useWaitForTransaction({
    hash: removeContractWrite.data?.hash,
    confirmations: 4,
  });

  useEffect(() => {
    setIsAddressValid(validateBitcoinAddress(withdrawalAddress));
  }, [withdrawalAddress]);

  if (connectedWallet?.network !== Networks.ETH) {
    return (
      <button
        className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false mt-5"
        type="button"
        onClick={() => connectToNetwork(Networks.ETH)}
      >
        Connect your ETH wallet
      </button>
    );
  }

  const removeLiquidity = () => {
    removeContractWrite.writeAsync?.();
  };

  return (
    <>
      <p className="mt-3 ml-1">
        LP token balance: {formatBalance(Number(balance?.data?.formatted))}
      </p>
      <div className="h-16 pb-4 mt-2 space-x-2 text-left">
        <div className="h-14 flex flex-grow items-center bg-transparent border border-white border-opacity-20 hover:border-bgLightest focus-within:border-bgLightest pl-3 pr-2 sm:pl-4 py-0.5 rounded-xl">
          <input
            className="focus:outline-none bg-transparent w-[300px] sm:min-w-[300px] sm:w-full text-white text-opacity-80 text-md placeholder:text-[#88818C] z-10"
            value={amount}
            placeholder="Enter burn amount"
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />
        </div>
      </div>
      <div className="h-16 pb-4 mt-2 space-x-2 text-left">
        <div className="h-14 flex flex-grow items-center bg-transparent border border-white border-opacity-20 hover:border-bgLightest focus-within:border-bgLightest pl-3 pr-2 sm:pl-4 py-0.5 rounded-xl">
          <input
            className="focus:outline-none bg-transparent w-[300px] sm:min-w-[300px] sm:w-full text-white text-opacity-80 text-md placeholder:text-[#88818C] z-10"
            value={withdrawalAddress}
            placeholder="Enter BTC withdrawal address"
            onChange={(e) => setWithdrawalAddress(e.target.value)}
          />
        </div>
      </div>
      <h4 className="opacity-50 my-2">
        Your BTC will be arrive shortly after burning your LPs.
      </h4>
      <div className="py-2 -mt-2 md:py-4">
        <button
          className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false"
          disabled={
            !isAddressValid || waitForRemove?.isLoading || contractErrorMessage
          }
          type="button"
          onClick={removeLiquidity}
        >
          {contractErrorMessage
            ? contractErrorMessage
            : (!amount || amount) === ""
            ? "Enter valid amount"
            : !isAddressValid
            ? "Enter valid address"
            : "Remove liquidity"}
        </button>
      </div>
    </>
  );
}

export default RemoveLiquidity;
