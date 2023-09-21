import React, {
  PropsWithChildren,
  createContext,
  useMemo,
  useState,
} from "react";
import { useConnect, useDisconnect } from "wagmi";
import { metamaskConnector, walletConnectConnector } from "../config/wagmi";
import usePhantom from "../hooks/use-phantom";
import Modal from "../components/modal";
import ListOption from "../components/list-option";

export enum Networks {
  ETH = "ETH",
  SOL = "SOL",
  ZKSyncEra = "ZKSyncEra",
  ZKSyncLite = "ZKSyncLite",
}

interface Connector {
  name: string;
  image: string;
  connect: () => Promise<any>;
}

export interface NetworkConfig {
  id: Networks;
  name: string;
  image: string;
  connectors: Connector[];
  disconnect: () => Promise<any>;
}

interface ConnectedWallet {
  network: Networks;
  address: string;
}

interface WalletContext {
  isConnected: boolean;
  connectedWallet?: ConnectedWallet;
  networks: NetworkConfig[];
  connectToNetwork: (network: Networks) => void;
}

const WalletContext = createContext<WalletContext>({
  isConnected: false,
  networks: [],
  connectToNetwork: () => null,
});

function WalletProvider({ children }: PropsWithChildren) {
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet>();
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { phantomProvider } = usePhantom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectorModalOptions, setConnectorModalOptions] = useState<
    Connector[]
  >([]);

  const connectEthMetamask =
    (networkType: Networks.ETH | Networks.ZKSyncLite) => () => {
      return disconnectCurrentWallet().then(() => {
        return connectAsync({ connector: metamaskConnector, chainId: 1 }).then(
          (res) => {
            setConnectedWallet({
              network: networkType,
              address: res.account.toString(),
            });
          }
        );
      });
    };

  const connectEthWalletConnect =
    (networkType: Networks.ETH | Networks.ZKSyncLite) => () => {
      return disconnectCurrentWallet().then(() => {
        return connectAsync({
          connector: walletConnectConnector,
          chainId: 1,
        }).then((res) => {
          setConnectedWallet({
            network: networkType,
            address: res.account.toString(),
          });
        });
      });
    };

  const connectZksyncEraMetamask = () => {
    return disconnectCurrentWallet().then(() => {
      return connectAsync({ connector: metamaskConnector, chainId: 324 }).then(
        (res) => {
          setConnectedWallet({
            network: Networks.ZKSyncEra,
            address: res.account.toString(),
          });
        }
      );
    });
  };

  const connectZksyncEraWalletConnect = () => {
    return disconnectCurrentWallet().then(() => {
      return connectAsync({
        connector: walletConnectConnector,
        chainId: 324,
      }).then((res) => {
        setConnectedWallet({
          network: Networks.ZKSyncEra,
          address: res.account.toString(),
        });
      });
    });
  };

  const connectSolPhantomWallet = () => {
    return disconnectCurrentWallet().then(async () => {
      const res = await phantomProvider?.connect();
      setConnectedWallet({
        network: Networks.SOL,
        address: res.publicKey.toString(),
      });
    });
  };

  const openInstallPhantomLink = () => {
    return new Promise((resolve) => {
      window?.open("https://phantom.app/download");
      resolve(true);
    });
  };

  // network configs
  const networks: NetworkConfig[] = useMemo(
    () => [
      {
        id: Networks.ETH,
        name: "Ethereum",
        image: "token-icons/eth.svg",
        connectors: [
          {
            name: "Metamask",
            image: "wallets/metamask.svg",
            connect: connectEthMetamask(Networks.ETH),
          },
          {
            name: "Wallet Connect",
            image: "wallets/walletconnect.svg",
            connect: connectEthWalletConnect(Networks.ETH),
          },
        ],
        disconnect: disconnectAsync,
      },
      {
        id: Networks.ZKSyncEra,
        name: "zkSync Era",
        image: "token-icons/zksync.svg",
        connectors: [
          {
            name: "Metamask",
            image: "wallets/metamask.svg",
            connect: connectZksyncEraMetamask,
          },
          {
            name: "Wallet Connect",
            image: "wallets/walletconnect.svg",
            connect: connectZksyncEraWalletConnect,
          },
        ],
        disconnect: disconnectAsync,
      },
      {
        id: Networks.ZKSyncLite,
        name: "zkSync Lite",
        image: "token-icons/zksync.svg",
        connectors: [
          {
            name: "Metamask",
            image: "wallets/metamask.svg",
            connect: connectEthMetamask(Networks.ZKSyncLite),
          },
          {
            name: "Wallet Connect",
            image: "wallets/walletconnect.svg",
            connect: connectEthWalletConnect(Networks.ZKSyncLite),
          },
        ],
        disconnect: disconnectAsync,
      },
      {
        id: Networks.SOL,
        name: "Solana",
        image: "token-icons/sol.svg",
        connectors: phantomProvider
          ? [
              {
                name: "Phantom",
                image: "wallets/phantom.svg",
                connect: connectSolPhantomWallet,
              },
            ]
          : [
              {
                name: "Install Phantom",
                image: "wallets/phantom.svg",
                connect: openInstallPhantomLink,
              },
            ],
        disconnect: phantomProvider?.disconnect,
      },
    ],
    [
      connectEthMetamask,
      connectZksyncEraMetamask,
      connectEthWalletConnect,
      connectZksyncEraWalletConnect,
      disconnectAsync,
      phantomProvider,
      connectSolPhantomWallet,
      openInstallPhantomLink,
    ]
  );

  const disconnectCurrentWallet = async () => {
    if (connectedWallet) {
      const network = networks.find(
        (item) => item.id === connectedWallet.network
      );
      try {
        network?.disconnect();
      } catch (error) {}
      setConnectedWallet(undefined);
      return;
    }
    return;
  };

  const connectToNetwork = (network: Networks) => {
    disconnectCurrentWallet().then(() => {
      const targetNetwork = networks.find((item) => item.id === network);
      targetNetwork?.connectors;
      setIsModalOpen(true);
      setConnectorModalOptions(targetNetwork?.connectors || []);
    });
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: connectedWallet !== undefined,
        connectedWallet,
        networks,
        connectToNetwork,
      }}
    >
      {children}
      <Modal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect Wallet"
      >
        {connectorModalOptions.map((item) => (
          <ListOption
            icon={item.image}
            label={item.name}
            onClick={() => {
              item.connect();
              setIsModalOpen(false);
            }}
          />
        ))}
      </Modal>
    </WalletContext.Provider>
  );
}

export { WalletContext, WalletProvider };
