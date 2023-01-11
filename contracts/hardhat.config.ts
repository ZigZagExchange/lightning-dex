import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  etherscan: {
    apiKey: "1CNJCN5DV3ADPJHXH2DRIM913MBSHYDE66"
  },
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/",
      accounts: []
    }
  },
};

export default config;
