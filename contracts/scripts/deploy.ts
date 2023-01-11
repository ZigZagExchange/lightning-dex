import { ethers } from "hardhat";

async function main() {
  const manager = "0x6f457Ce670D18FF8bda00E1B5D9654833e7D91BB";
  const wbtc_address = "0x1DF4feb27f0E99F0011A4564Cf7230D3E73c9d6d";
  const Bridge = await ethers.getContractFactory("ZigZagBTCBridge");
  const bridge = await Bridge.deploy(manager, wbtc_address);

  await bridge.deployed();

  console.log(`Bridge deployed to ${bridge.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
