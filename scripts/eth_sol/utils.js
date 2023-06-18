import fetch from 'node-fetch'

const FEE_MULTIPLIER = 0.999

export function getOutAmountAndFee (
  depositCurrency, // ETH or SOL
  outgoingCurrency, // ETH or SOL
  depositUsdPrice,
  outgoingUsdPrice,
  depositAmount
  ) {
    const swapPrice = depositUsdPrice / outgoingUsdPrice
    sanityCheckPrices(depositCurrency, outgoingCurrency, swapPrice)
    const outgoingAmount = depositAmount * swapPrice
    const outgoingAmountMinusFee = outgoingAmount * FEE_MULTIPLIER
    const calculatedFee = outgoingAmount - outgoingAmountMinusFee
    const oneDollarWorthOfOutgoing = 1 / outgoingUsdPrice
    const outgoingFee = Math.max(calculatedFee, oneDollarWorthOfOutgoing)
    return {
      amountMinusFee: outgoingAmount - outgoingFee,
      fee: outgoingFee
    }
}

function sanityCheckPrices (
  depositCurrency, // ETH or SOL
  outgoingCurrency, // ETH or SOL
  price
) {
  if (depositCurrency !== 'ETH' && depositCurrency !== 'SOL') {
    throw new Error(`invalid deposit currency: ${depositCurrency}`)
  }
  if (outgoingCurrency !== 'ETH' && outgoingCurrency !== 'SOL') {
    throw new Error(`invalid outgoing currency: ${outgoingCurrency}`)
  }
  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error(`invalid ${depositCurrency}/${outgoingCurrency} price`)
  }
  if (depositCurrency === 'ETH' && outgoingCurrency === 'SOL') {
    if (price > 142 || price < 57) {
      throw new Error('SOL/ETH price failed sanity check')
    }
  }
  if (depositCurrency === 'SOL' && outgoingCurrency === 'ETH') {
    if (price > 0.015 || price < 0.006) {
      throw new Error('ETH/SOL price failed sanity check')
    }
  }
  return
}

export function fetchPrices () {
  return fetch('https://api.coincap.io/v2/assets', {
    headers: {
      'Authorization': `Bearer ${process.env.COIN_CAP_API_KEY}`
    }
  }).then(res => res.json()).then(({data}) => {
    const ethUsd = data.find(asset => asset.id === 'ethereum').priceUsd
    const solUsd = data.find((asset) => asset.id === 'solana').priceUsd
    return {
      ethUsd: Number(ethUsd),
      solUsd: Number(solUsd)
    }
  })
}