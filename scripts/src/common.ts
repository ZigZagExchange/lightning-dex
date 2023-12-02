import { ethers } from "ethers";
import BN from "bignumber.js";

export enum Assets {
  ETH = "ETH",
  SOL = "SOL",
  BTC = "BTC",
  ZKSync = "ZKSync",
  ZKSyncLite = "ZKSyncLite",
  ZZTokenZKSyncLite = "ZZTokenZKSyncLite",
  ZZTokenZKSync = "ZZTokenZKSync",
}

export function WADToAmount(input: ethers.BigNumber): string {
  return new BN(input.toString()).div(1e18).toString();
}

export function amountToWAD(input: number): string {
  return new BN(input).times(10e8).toFixed();
}

export const MIN_ZZ_TOKEN_DEPOSIT = 10;
