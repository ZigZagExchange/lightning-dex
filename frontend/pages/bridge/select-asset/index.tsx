import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useBridge } from "../../../hooks/use-bridge";
import { Asset, Assets } from "../../../contexts/bridge-context";
import Modal from "../../../components/modal";
import ListOption from "../../../components/list-option";
import ChevronDown from "./chevron-down.svg";

interface Props {
  direction: "deposit" | "outgoing";
}

function SelectAsset({ direction }: Props) {
  const {
    depositAsset,
    setDepositAsset,
    outgoingAsset,
    setOutgoingAsset,
    depositChain,
    outgoingChain,
    chains,
  } = useBridge();
  const [displayAsset, setDisplayAsset] = useState<Asset>();
  const [options, setOptions] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const chainId = direction === "deposit" ? depositChain : outgoingChain;
    const assetId = direction === "deposit" ? depositAsset : outgoingAsset;
    const chain = chains.find((item) => item.id === chainId);
    const selectedAsset = chain?.assets.find((item) => item.id === assetId);
    setDisplayAsset(selectedAsset);
  }, [depositAsset, outgoingAsset, direction, depositChain, outgoingChain]);

  useEffect(() => {
    const selectedDepositChain = chains.find(
      (item) => item.id === depositChain
    );
    const selectedOutgoingChain = chains.find(
      (item) => item.id === outgoingChain
    );
    const selectedDepositAsset = selectedDepositChain?.assets.find(
      (item) => item.id === depositAsset
    );
    const selectedOutgoingAsset = selectedOutgoingChain?.assets.find(
      (item) => item.id === outgoingAsset
    );

    if (direction === "deposit") {
      const supportedDepositAssetsForSelectedOutgoingAsset =
        selectedOutgoingAsset?.supportedDepositAssets?.[depositChain];
      if (Array.isArray(supportedDepositAssetsForSelectedOutgoingAsset)) {
        setOptions(
          selectedDepositChain?.assets.filter((item) =>
            supportedDepositAssetsForSelectedOutgoingAsset.includes(item.id)
          ) || []
        );
      } else {
        setOptions(
          selectedDepositChain?.assets?.filter((item) => item.canDeposit) || []
        );
      }
    }

    if (direction === "outgoing") {
      const supportedOutgoingAssetsForSelectedDepositAsset =
        selectedDepositAsset?.supportedOutgoingAssets?.[outgoingChain];
      if (Array.isArray(supportedOutgoingAssetsForSelectedDepositAsset)) {
        setOptions(
          selectedOutgoingChain?.assets.filter((item) =>
            supportedOutgoingAssetsForSelectedDepositAsset.includes(item.id)
          ) || []
        );
      } else {
        setOptions(
          selectedOutgoingChain?.assets.filter((item) => item.canReceive) || []
        );
      }
    }
  }, [depositAsset, depositChain, outgoingAsset, outgoingChain, direction]);

  const onChange = (asset: Assets) => {
    if (direction === "deposit") {
      setDepositAsset(asset);
    }
    if (direction === "outgoing") {
      setOutgoingAsset(asset);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <button className="sm:mt-[-1px] flex-shrink-0 mr-[-1px] w-[35%]">
        <div
          className="group rounded-xl  border border-transparent transform-gpu transition-all duration-125"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex bg-white bg-opacity-10 items-center rounded-lg py-1.5 pl-2 h-14 justify-between pr-2">
            <div className="flex items-center">
              <div className="self-center flex-shrink-0 hidden mr-1 sm:block">
                <div className="relative flex p-1 rounded-full">
                  <Image
                    alt={displayAsset?.name || "name"}
                    width={40}
                    height={40}
                    className="w-7 h-7"
                    src={displayAsset?.image || ""}
                  />
                </div>
              </div>

              <div className="text-left cursor-pointer">
                <h4 className="text-lg font-medium text-gray-300 ">
                  <span>{displayAsset?.name}</span>
                </h4>
              </div>
            </div>
            {options.length > 1 && (
              <Image src={ChevronDown} alt="" width={20} />
            )}
          </div>
        </div>
      </button>
      <Modal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select asset"
      >
        {options.map((item, index) => (
          <ListOption
            key={index}
            icon={item.image}
            label={item.name}
            onClick={() => onChange(item.id)}
          />
        ))}
      </Modal>
    </>
  );
}

export default SelectAsset;
