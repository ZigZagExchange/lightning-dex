import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { useBalance } from "wagmi";
import { useWallet } from "../hooks/use-wallet";
import { Networks } from "./wallet-context";
import * as zksyncLite from "zksync";
import { useEthersSigner } from "../hooks/use-ethers-signer";
import { WADToAmount } from "../utils/math";
import usePhantom from "../hooks/use-phantom";
import * as solana from "@solana/web3.js";

const solRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC as string;

interface BalanceContext {
  balance: number;
  balanceFormatted: string;
  getZKSyncLiteZZTokenBalance: () => Promise<number>;
}

const BalanceContext = createContext<BalanceContext>({
  balance: 0,
  balanceFormatted: "0.000",
  getZKSyncLiteZZTokenBalance: () => Promise.resolve(0),
});

function BalanceProvider({ children }: PropsWithChildren) {
  const [balance, setBalance] = useState(0);
  const [balanceFormatted, setBalanceFormatted] = useState("0.0000");
  const { connectedWallet } = useWallet();
  const { data: ethBalance } = useBalance({
    address: connectedWallet?.address as `0x${string}` | undefined,
  });
  const ethersSigner = useEthersSigner();
  const { phantomProvider } = usePhantom();

  useEffect(() => {
    if (connectedWallet?.network === Networks.ETH) {
      setBalance(Number(ethBalance?.formatted));
      setBalanceFormatted(
        `${Number(ethBalance?.formatted).toPrecision(4)} ETH`
      );
    }
    if (connectedWallet?.network === Networks.ZKSyncEra) {
      setBalance(Number(ethBalance?.formatted));
      setBalanceFormatted(
        `${Number(ethBalance?.formatted).toPrecision(4)} ETH`
      );
    }
    if (connectedWallet?.network === Networks.ZKSyncLite) {
      if (ethersSigner) {
        setZkSyncLiteBalance();
      }
    }
    if (connectedWallet?.network === Networks.SOL) {
      if (phantomProvider) {
        setSolBalance();
      }
    }
  }, [
    connectedWallet?.network,
    ethersSigner,
    phantomProvider,
    ethBalance?.formatted,
  ]);

  async function setZkSyncLiteBalance() {
    if (ethersSigner) {
      const zksyncProvider = await zksyncLite.getDefaultProvider("mainnet");
      const zkSyncWallet = await zksyncLite.Wallet.fromEthSigner(
        ethersSigner,
        zksyncProvider
      );
      const balance = await zkSyncWallet.getBalance("ETH");
      const balanceValue = WADToAmount(balance);
      setBalance(balanceValue);
      setBalanceFormatted(`${balanceValue.toPrecision(4)} ETH`);
    }
  }

  async function getZKSyncLiteZZTokenBalance(): Promise<number> {
    if (ethersSigner) {
      const zksyncProvider = await zksyncLite.getDefaultProvider("mainnet");
      const zkSyncWallet = await zksyncLite.Wallet.fromEthSigner(
        ethersSigner,
        zksyncProvider
      );
      const balance = await zkSyncWallet.getBalance("ZZ");
      return WADToAmount(balance);
    }

    return 0;
  }

  async function setSolBalance() {
    const connection = new solana.Connection(solRpcUrl);
    const accountInfo = await connection.getAccountInfo(
      phantomProvider.publicKey
    );
    const balance = (accountInfo?.lamports || 0) / solana.LAMPORTS_PER_SOL;
    setBalance(balance);
    setBalanceFormatted(`${balance.toPrecision(4)} SOL`);
  }

  return (
    <BalanceContext.Provider
      value={{ balance, balanceFormatted, getZKSyncLiteZZTokenBalance }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export { BalanceContext, BalanceProvider };
