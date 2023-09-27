import { createConfig, configureChains, mainnet } from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { zkSync } from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY as string;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, zkSync],
  [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()]
);

export const metamaskConnector = new MetaMaskConnector({ chains });
export const walletConnectConnector = new WalletConnectConnector({
  chains,
  options: {
    projectId,
  },
});

const configWagmi = createConfig({
  autoConnect: false,
  connectors: [metamaskConnector, walletConnectConnector],
  publicClient,
  webSocketPublicClient,
});

export default configWagmi;
