import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import { CHAIN_CONFIG } from '../helpers/constants'

export async function connectWallet() {
  const injected = injectedModule()

  const onboard = Onboard({
    wallets: [injected],
    chains: [
      {
        id: '0xa4b1',
        token: 'ETH',
        label: 'Arbitrum',
        rpcUrl: CHAIN_CONFIG.arbitrum.rpcUrl
      },
    ],
  })

  return await onboard.connectWallet()
}
