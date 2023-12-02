import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"; // UNCOMMENT TO USE NON-ZKSYNC
import "@nomiclabs/hardhat-etherscan"; // UNCOMMENT TO USE NON-ZKSYNC

// import "@matterlabs/hardhat-zksync-deploy"; // UNCOMMENT TO USE ZKSYNC
// import "@matterlabs/hardhat-zksync-solc"; // UNCOMMENT TO USE ZKSYNC
// import "@matterlabs/hardhat-zksync-verify"; // UNCOMMENT TO USE ZKSYNC

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  etherscan: {
    apiKey: "",
  },
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/3c7f5083c38943ea95aa49278ddeba53",
      accounts: [],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/3c7f5083c38943ea95aa49278ddeba53",
      accounts: [],
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [],
    },
    /*zkSyncEraGoerli: {
      url: "https://testnet.era.zksync.dev",
      accounts: [],
      ethNetwork: "goerli",
      zksync: true,
      verifyURL:
        "https://zksync2-testnet-explorer.zksync.dev/contract_verification",
    },
    zkSyncEra: {
      url: "https://mainnet.era.zksync.io",
      accounts: [],
      ethNetwork: "mainnet",
      zksync: true,
      verifyURL:
        "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    },*/
  },
};

export default config;
