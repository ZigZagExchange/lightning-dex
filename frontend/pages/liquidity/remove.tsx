import { useEffect, useState } from "react";
import { Networks } from "../../contexts/wallet-context";
import { useWallet } from "../../hooks/use-wallet";
import { format, set } from "date-fns";
import Modal from "../../components/modal";
import { validate as validateBitcoinAddress } from "bitcoin-address-validation";
import { useDebounce } from "use-debounce";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { BTC_LP_CONTRACT_ABI, BTC_LP_CONTRACT_ADDRESS } from "../../data";

interface Position {
  deposit_amount: string;
  deposit_currency: string;
  deposit_timestamp: string;
  deposit_txid: string;
  lp_token_id: number;
  lp_token_mint_txid: string;
  outgoing_address: string;
}

function RemoveLiquidity() {
  const { connectedWallet, connectToNetwork } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [focusedPosition, setFocusedPosition] = useState<number>();
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [isAddressValid, setIsAddressValid] = useState(false);

  const debouncedWithdrawAddress = useDebounce(withdrawalAddress, 500);
  const prepareRemoveContractWrite = usePrepareContractWrite({
    address: BTC_LP_CONTRACT_ADDRESS,
    abi: BTC_LP_CONTRACT_ABI,
    functionName: "removeLiquidity",
    args: [focusedPosition, debouncedWithdrawAddress[0]],
  });
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

  useEffect(() => {
    fetch(
      `https://api.zap.zigzag.exchange/get-liquidity-positions?address=${connectedWallet?.address}`
    )
      .then((res) => res.json())
      .then((res) => {
        setPositions(res);
      });
  }, [connectedWallet?.address]);

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
    removeContractWrite.writeAsync?.().then(() => {
      setFocusedPosition(undefined);
    });
  };

  return (
    <>
      <h4 className="mt-5 font-medium text-lg">Your current positions:</h4>
      {positions.map((position, index) => (
        <div className="flex mt-2 items-center justify-between" key={index}>
          <div>
            <h4 className="text-lg">
              {position.deposit_amount} {position.deposit_currency}
            </h4>
            <h5 className="text-sm opacity-60">
              {format(
                typeof position.deposit_timestamp === "string"
                  ? new Date(position.deposit_timestamp)
                  : new Date(),
                "do LLL HH:mm"
              )}
            </h5>
          </div>
          <button
            className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false mt-5"
            type="button"
            onClick={() => setFocusedPosition(position.lp_token_id)}
          >
            Remove
          </button>
        </div>
      ))}
      <Modal
        isVisible={focusedPosition !== undefined}
        onClose={() => setFocusedPosition(undefined)}
        title="Remove liquidity"
      >
        <div className="h-16 pb-4 mt-7 space-x-2 text-left">
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
          Your BTC will be arrive shortly after burning your LP.
        </h4>
        <div className="py-2 -mt-2 md:py-4">
          <button
            className="group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF] false"
            disabled={!isAddressValid || waitForRemove?.isLoading}
            type="button"
            onClick={removeLiquidity}
          >
            {!isAddressValid ? "Enter valid address" : "Remove liquidity"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export default RemoveLiquidity;
