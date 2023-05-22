import { createConfig, configureChains, mainnet, sepolia } from 'wagmi'
 
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
 
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY as string
 
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
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
  ],
  publicClient,
  webSocketPublicClient,
})

export default configWagmi