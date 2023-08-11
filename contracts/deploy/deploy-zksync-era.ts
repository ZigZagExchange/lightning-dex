import { utils, Wallet } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  const beneficiary = "0x4360180daB27343dAd9E27785f541AF52140ED2e";

  const wallet = new Wallet("DEPLOYER_PRIVATE_KEY");

  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("ZKSyncBridge");

  const greeterContract = await deployer.deploy(artifact, [beneficiary]);

  await greeterContract.deployed()

  console.log(`${artifact.contractName} was deployed to ${greeterContract.address}`);
}