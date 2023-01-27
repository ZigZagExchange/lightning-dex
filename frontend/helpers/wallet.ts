import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import { CHAIN_CONFIG } from '../helpers/constants'

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

export async function connectWallet() {
  const walletState = onboard.state.get();
  if (walletState.wallets.length > 0) return walletState.wallets;

  const walletsSub = onboard.state.select('wallets')
  const { unsubscribe } = walletsSub.subscribe((wallets) => {
    const connectedWallets = wallets.map(({ label }) => label)
    window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets))
  })

  const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets') || "[]")

  if (previouslyConnectedWallets.length > 0) {
    return await onboard.connectWallet({
      autoSelect: { label: previouslyConnectedWallets[0], disableModals: true }
    })

  }

  return await onboard.connectWallet()
}
