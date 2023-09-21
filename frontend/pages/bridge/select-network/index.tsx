import React, { useState } from "react";
import Image from "next/image";
import { useBridge } from "../../../hooks/use-bridge";
import { Chains } from "../../../contexts/bridge-context";

interface Props {
  direction: "deposit" | "outgoing";
}

function SelectNetwork({ direction }: Props) {
  const {
    chains,
    depositChain,
    setDepositChain,
    outgoingChain,
    setOutgoingChain,
  } = useBridge();
  const currentlySelected =
    direction === "deposit" ? depositChain : outgoingChain;

  const onChange = (chain: Chains) => {
    if (direction === "deposit") {
      setDepositChain(chain);
    }
    if (direction === "outgoing") {
      setOutgoingChain(chain);
    }
  };

  return (
    <div className="flex items-center space-x-4 md:space-x-3">
      {chains.map((item, index) =>
        item.id === currentlySelected ? (
          <div
            className="px-1 flex items-center bg-primary text-white border border-[#5170ad] dark:border-[#5170ad] rounded-full"
            key={index}
          >
            <Image
              src={item.image}
              alt="icon"
              width={22}
              height={22}
              className="w-5 h-5 my-1 mr-0 rounded-full md:mr-1 opacity-80"
            />
            <div className="hidden md:inline-block lg:inline-block">
              <div className="mr-2 text-sm text-white">{item.name}</div>
            </div>
          </div>
        ) : (
          <button
            className="relative token-item flex justify-center items-center w-7 h-7 md:w-7 px-0.5 py-0.5 border border-gray-500 rounded-full"
            onClick={() => onChange(item.id)}
          >
            <div className="inline-block">
              <Image
                src={item.image}
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
                  <div className="p-3 text-white">{item.name}</div>
                </div>
              </div>
            </div>
          </button>
        )
      )}
    </div>
  );
}

export default SelectNetwork;
