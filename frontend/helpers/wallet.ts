import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'
import { MAINNET_RPC_URL, GOERLI_RPC_URL } from '../helpers/constants'

export async function connectWallet() {
  const injected = injectedModule()

  const onboard = Onboard({
    wallets: [injected],
    chains: [
      //{
      //  id: '0x1',
      //  token: 'ETH',
      //  label: 'Ethereum Mainnet',
      //  rpcUrl: MAINNET_RPC_URL
      //},
      {
        id: '0x5',
        token: 'ETH',
        label: 'Goerli Testnet',
        rpcUrl: GOERLI_RPC_URL
      },
    ],
  })

  return await onboard.connectWallet()
}
