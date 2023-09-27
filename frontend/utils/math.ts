import { ethers } from "ethers";
import BN from "bignumber.js";

export function WADToAmount(input: ethers.BigNumberish): number {
  return new BN(input.toString()).div(1e18).toNumber();
}

export function amountToWAD(input: string): string {
  return new BN(input).times(1e18).toFixed(0);
}
