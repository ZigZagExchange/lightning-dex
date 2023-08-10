import { utils, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

export default async function (hre: HardhatRuntimeEnvironment) {
  const beneficiary = "";

  const wallet = new Wallet("PRIVATE_KEY_GOES_HERE");

  const deployer = new Deployer(hre, wallet);

  const artifact = await deployer.loadArtifact("BTCBridge");

  const greeterContract = await deployer.deploy(artifact, [beneficiary]);

  console.log(`${artifact.contractName} was deployed to ${greeterContract.address}`);
}