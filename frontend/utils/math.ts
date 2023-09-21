import { ethers } from "ethers";
import BN from "bignumber.js";

export function WADToAmount(input: ethers.BigNumberish): number {
  return new BN(input.toString()).div(1e18).toNumber();
}
