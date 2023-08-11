import { Assets } from "./common";
import axios from 'axios'

const FEE_MULTIPLIER = 0.001 // 0.1% fee

function tidyPrice (price: string): number {
  return Number(Number(price).toFixed(4))
}

function tidyCurrencyAmount (input: number): number {
  return Number(input.toFixed(8))
}

type USDPriceMap = {
  [key in Assets]: number // usd price of each asset
}

export async function generateUSDPriceMap (): Promise<USDPriceMap> {
  const result = await axios.get('https://api.coincap.io/v2/assets', {
    headers: {
      'Authorization': `Bearer ${process.env.COIN_CAP_API_KEY}`
    }
  })

  const ethUsdPrice = result.data.data.find((asset: any) => asset.id === 'ethereum').priceUsd
  const solUsdPrice = result.data.data.find((asset: any) => asset.id === 'solana').priceUsd
  const btcUsdPrice = result.data.data.find((asset: any) => asset.id === 'bitcoin').priceUsd

  return {
    [Assets.ETH]: tidyPrice(ethUsdPrice),
    [Assets.SOL]: tidyPrice(solUsdPrice),
    [Assets.BTC]: tidyPrice(btcUsdPrice),
    [Assets.ZKSync]: tidyPrice(ethUsdPrice)
  }
}

export function getOutgoingAmountAndFee (usdPriceMap: USDPriceMap, depositAsset: Assets, outgoingAsset: Assets, depositAmount: number) {
  const depositAmountInUSD = depositAmount * usdPriceMap[depositAsset]
  const outgoingAmount = depositAmountInUSD / usdPriceMap[outgoingAsset]
  const bridgeFee = outgoingAmount * FEE_MULTIPLIER;
  const oneDollarInOutgoing = 1 / usdPriceMap[outgoingAsset]
  const fee = Math.max(bridgeFee, oneDollarInOutgoing)
  return {
    amountMinusFee: tidyCurrencyAmount(outgoingAmount - fee),
    fee: tidyCurrencyAmount(fee),
    outgoingAmount: tidyCurrencyAmount(outgoingAmount)
  }
}