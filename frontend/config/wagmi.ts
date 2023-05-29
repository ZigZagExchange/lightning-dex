import { createConfig, configureChains, mainnet, sepolia } from 'wagmi'

import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { PhantomConnector } from '../utils/phantom-wagmi-connector'
import { arbitrum, bsc, optimism, polygon } from 'viem/chains'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY as string

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, arbitrum, bsc, optimism, polygon],
  [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()],
)

const configWagmi = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
      },
    }),
    new PhantomConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
})

export default configWagmi