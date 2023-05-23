import { ethers } from 'ethers'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const bridgeAbi = JSON.parse(fs.readFileSync('BTCBridge.json', "utf-8")).abi;

const ethersProvider = new ethers.providers.InfuraProvider("goerli", "3c7f5083c38943ea95aa49278ddeba53");

const BRIDGE_ADDRESS = "0x1e3795cB5bAf44b23aBAF988c0fb77ed21CE6346";
const Bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, ethersProvider);

const events = await Bridge.queryFilter(Bridge.filters.Deposit(), 0, "latest");
console.log(events);
