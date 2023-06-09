import { ethers } from "hardhat";

async function main() {
  const beneficiary = "0x26AFeEBc8012FD47521c955cfAd6d6172B06516C"; // ETH-SOL goerli
  //const beneficiary = "0x6f457Ce670D18FF8bda00E1B5D9654833e7D91BB"; // ETH-BTC goerli
  //const beneficiary = "0x98d066538842d2585fd26d0CF01C0f24e8eD716f"; // ETH-BTC mainnet
  const Bridge = await ethers.getContractFactory("BTCBridge");
  const bridge = await Bridge.deploy(beneficiary);

  await bridge.deployed();

  console.log(`Bridge deployed to ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
