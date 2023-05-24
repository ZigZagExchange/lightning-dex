import { ethers } from 'ethers'
import dotenv from 'dotenv'
import fs from 'fs'
import { db } from 'db'

dotenv.config()

const bridgeAbi = JSON.parse(fs.readFileSync('BTCBridge.json', "utf-8")).abi;

const ethersProvider = new ethers.providers.InfuraProvider("goerli", "3c7f5083c38943ea95aa49278ddeba53");

const BRIDGE_ADDRESS = "0x428Fe4d080A62127E6Bf167E05b05cF30079d3f2";
const Bridge = new ethers.Contract(BRIDGE_ADDRESS, bridgeAbi, ethersProvider);

const events = await Bridge.queryFilter(Bridge.filters.Deposit(), -100, "latest");
console.log(events);
