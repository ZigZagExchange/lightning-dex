// To deploy: 
//   npx hardhat compile --network zkSyncEraGoerli
//   npx hardhat deploy-zksync --script deploy-zksync-era.ts --network zkSyncEraGoerli
//   npx hardhat verify --network zkSyncEraGoerli <contract-address>

import { utils, Wallet } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  //const beneficiary = ""; // wallet address
  const beneficiary = "0x9c84e4Ea84DeFEe45FF6Ec64ea3b1D85C7B9a50E"; // mainnet

  const wallet = new Wallet("");

  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("ZKSyncBridge");

  const greeterContract = await deployer.deploy(artifact, []);

  await greeterContract.deployed()

  await greeterContract.transferOwnership(beneficiary)

  console.log(`${artifact.contractName} was deployed to ${greeterContract.address}`);
}
