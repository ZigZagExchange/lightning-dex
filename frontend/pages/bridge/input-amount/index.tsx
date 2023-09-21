import React, { useEffect, useState } from "react";
import { useBridge } from "../../../hooks/use-bridge";
import { useBalance } from "../../../hooks/use-balance";

interface Props {
  direction: "deposit" | "outgoing";
}

function InputAmount({ direction }: Props) {
  const { depositAmount, setDepositAmount, outgoingAmount, setOutgoingAmount } =
    useBridge();
  const amount = direction === "deposit" ? depositAmount : outgoingAmount;
  const [showMaxButton, setShowMaxButton] = useState(false);
  const { balance } = useBalance();

  useEffect(() => {
    if (direction === "deposit" && balance > 0) {
      setShowMaxButton(true);
    }
  }, [direction, balance]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (direction === "deposit") {
      setDepositAmount(e.target.value);
    }
    if (direction === "outgoing") {
      setOutgoingAmount(e.target.value);
    }
  };

  const handleMax = () => {
    setDepositAmount(String(balance));
  };

  return (
    <>
      <div className="flex flex-grow items-center w-full h-16 border-none">
        <input
          pattern="[0-9.]+"
          className="ml-4 -mt-0 focus:outline-none bg-transparent pr-4 w-5/6
                placeholder:text-[#88818C]  text-white text-opacity-80 text-lg md:text-2xl lg:text-2xl font-medium z-10"
          placeholder="0.0000"
          value={amount}
          onChange={onChange}
        />
      </div>
      {showMaxButton && (
        <div className="hidden mr-2 sm:inline-block">
          <button
            className="group cursor-pointer text-white outline-none focus:outline-none active:outline-none ring-none transition-all duration-100 transform-gpu pt-1 pb-1 pl-2 pr-2 mr-2 rounded-md text-sm font-medium bg-bgLighter hover:bg-bgLightest active:bg-bgLightest"
            onClick={handleMax}
          >
            Max
          </button>
        </div>
      )}
    </>
  );
}

export default InputAmount;
