import React from "react";
import FlexBox from "../flex-box";
import Image from "next/image";

function ListOption({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <FlexBox className="justify-between">
      <button
        className="inline-flex items-center py-2 px-6 my-4 rounded-xl mt-2 shadow-sm border border-transparent  group transition-all duration-75 hover:!border-orange-500  hover:bg-[#5397F7] hover:bg-opacity-30"
        onClick={onClick}
      >
        <Image
          src={icon}
          alt="icon"
          className="w-8 mr-3 rounded-lg"
          width={20}
          height={20}
        />
        <span className="text-lg font-medium mt-0.5 transition-all duration-75 text-white">
          {label}
        </span>
      </button>
    </FlexBox>
  );
}

export default ListOption;
