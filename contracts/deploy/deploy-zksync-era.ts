import { utils, Wallet } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  const beneficiary = ""; // wallet address

  const wallet = new Wallet("");

  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("ZKSyncBridge");

  const greeterContract = await deployer.deploy(artifact, []);

  await greeterContract.deployed()

  await greeterContract.transferOwnership(beneficiary)

  console.log(`${artifact.contractName} was deployed to ${greeterContract.address}`);
}