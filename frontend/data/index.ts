export const depositContractABI = [
  {
    inputs: [
      { internalType: "address", name: "_beneficiary", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "out_chain",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "out_address",
        type: "string",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    inputs: [],
    name: "beneficiary",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "out_chain", type: "string" },
      { internalType: "string", name: "out_address", type: "string" },
    ],
    name: "depositERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "out_chain", type: "string" },
      { internalType: "string", name: "out_address", type: "string" },
    ],
    name: "depositETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export const ETH_DEPOSIT_CONTRACT =
  "0xd484ed3cdF6f34d9Cca869240107E1E8a03BaE96";
export const ZKSYNC_DEPOSIT_CONTRACT =
  "0x0E8c486D79AEe765fb04cC563AEa5a93A9a1eEB8";
export const ZZ_TOKEN_CONTRACT_ADDRESS_ON_ZKSYNC_ERA =
  "0x1ab721f531Cab4c87d536bE8B985EAFCE17f0184";
export const ZKSYNC_LITE_LIQUIDITY_POOL =
  "0x9c84e4Ea84DeFEe45FF6Ec64ea3b1D85C7B9a50E";
export const BTC_LP_CONTRACT_ADDRESS =
  "0x8af49c65D94c17806f48aFC9Ff20A8350B3E471C";

export const BTC_LP_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "withdrawalAddress",
        type: "string",
      },
    ],
    name: "removeLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
