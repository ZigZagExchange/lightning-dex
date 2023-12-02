import { ethers } from "hardhat";

async function main() {
  const LPToken = await ethers.getContractFactory("ZapBTCLPToken");
  const lpToken = await LPToken.deploy();
  await lpToken.deployed();
  console.log(`Bridge deployed to ${lpToken.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
