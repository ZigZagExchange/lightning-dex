import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  etherscan: {
    apiKey: {
      mainnet: "",
      arbitrumOne: "",
      goerli: ""
    }
  },
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/3c7f5083c38943ea95aa49278ddeba53",
      accounts: []
    }, 
    goerli: {
      url: "https://goerli.infura.io/v3/3c7f5083c38943ea95aa49278ddeba53",
      accounts: []
    }, 
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: []
    },
    zkSyncEraGoerli: {
      url: 'https://testnet.era.zksync.dev',
      accounts: [],
      ethNetwork: 'goerli',
      zksync: true
    }
  },
};

export default config;
