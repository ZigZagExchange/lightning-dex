import {
  PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Networks } from "./wallet-context";
import { useBridgeApi } from "../hooks/use-bridge-api";
import { validate as validateBitcoinAddress } from "bitcoin-address-validation";
import { ethers } from "ethers";
import * as solana from "@solana/web3.js";
import usePhantom from "../hooks/use-phantom";
import { useEvm } from "../hooks/use-evm";

function validateSolanaAddress(address: string) {
  try {
    new solana.PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export enum Chains {
  ETH = "ETH",
  BTC = "BTC",
  SOL = "SOL",
  ZKSyncEra = "ZKSyncEra",
  ZKSyncLite = "ZKSyncLite",
}

// not 1-1 enum so it matches backend
export enum Assets {
  ETH = "ETH",
  BTC = "BTC",
  SOL = "SOL",
  ZKSyncEra = "ZKSync", // eth on zksync era
  ZZTokenZKSyncEra = "ZZTokenZKSync",
  ZKSyncLite = "ZKSyncLite", // eth of zksync lite
  ZZTokenZKSyncLite = "ZZTokenZKSyncLite",
}

type SupportedTrades = {
  [key in Chains]?: Assets[];
};

export interface Asset {
  id: Assets;
  name: string;
  image: string;
  deposit: () => Promise<void>;
  canDeposit: boolean;
  canReceive: boolean;
  priceMapKey: string;
  supportedDepositAssets?: SupportedTrades; // leave undefined to support all
  supportedOutgoingAssets?: SupportedTrades; // leave undefined to support all
  feeDisplay: string;
  networkFeeDisplay: string;
  requiresAddressInput: boolean; // a specificized outgoing address
  validateAddress: (address: string) => boolean;
  requiresConnectionTo?: Networks;
  availableLiquidityMapKey: string;
  miniumDeposit?: number;
}

interface AssetChain {
  id: Chains;
  name: string;
  image: string;
  requiresConnectionTo?: Networks;
  assets: Asset[];
}

interface BridgeContext {
  depositChain: Chains;
  setDepositChain: (chain: Chains) => void;
  outgoingChain: Chains;
  setOutgoingChain: (chain: Chains) => void;
  depositAsset: Assets;
  setDepositAsset: (asset: Assets) => void;
  outgoingAsset: Assets;
  setOutgoingAsset: (asset: Assets) => void;
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  outgoingAmount: string;
  setOutgoingAmount: (value: string) => void;
  chains: AssetChain[];
  swapAssets: () => void;
  getCurrentDepositAsset: () => Asset | null;
  getCurrentOutgoingAsset: () => Asset | null;
  withdrawalAddress: string;
  setWithdrawalAddress: (value: string) => void;
  isLoading: boolean;
  bitcoinDepositAddress?: string;
}

const BridgeContext = createContext<BridgeContext>({
  depositChain: Chains.BTC,
  setDepositChain: () => null,
  outgoingChain: Chains.ETH,
  setOutgoingChain: () => null,
  depositAsset: Assets.BTC,
  setDepositAsset: () => null,
  outgoingAsset: Assets.ETH,
  setOutgoingAsset: () => null,
  depositAmount: "",
  setDepositAmount: () => null,
  outgoingAmount: "",
  setOutgoingAmount: () => null,
  chains: [],
  swapAssets: () => null,
  getCurrentDepositAsset: () => null,
  getCurrentOutgoingAsset: () => null,
  withdrawalAddress: "",
  setWithdrawalAddress: () => null,
  isLoading: false,
});

function BridgeProvider({ children }: PropsWithChildren) {
  const [depositChain, setDepositChain] = useState<Chains>(Chains.BTC);
  const [outgoingChain, setOutgoingChain] = useState<Chains>(Chains.ETH);
  const [depositAsset, setDepositAsset] = useState<Assets>(Assets.BTC);
  const [outgoingAsset, setOutgoingAsset] = useState<Assets>(Assets.ETH);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [outgoingAmount, setOutgoingAmount] = useState<string>("");
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>("");
  const { calculateOutgoingAmount, calculateDepositAmount } = useBridgeApi();
  const [isLoading, setIsLoading] = useState(false);
  const [bitcoinDepositAddress, setBitcoinDepositAddress] = useState<string>();
  const { phantomProvider } = usePhantom();
  const {
    isEvmTxLoading,
    depositL1Eth,
    depositZksyncEraEth,
    depositZksyncZZTokens,
    depositZksyncLiteEth,
    depositZksyncLiteZZTokens,
  } = useEvm(depositAmount, withdrawalAddress, outgoingAsset);

  // ensure that when target assets are changed the deposit and outgoing amounts are correct
  useEffect(() => {
    onDepositAmountChange(depositAmount);
  }, [depositAsset, outgoingAsset]);

  const getCurrentDepositAsset = (): Asset => {
    const currentChain = chains.find((item) => item.id === depositChain);
    const asset = currentChain?.assets.find((item) => item.id === depositAsset);
    return asset as Asset;
  };

  const getCurrentOutgoingAsset = (): Asset => {
    const currentChain = chains.find((item) => item.id === outgoingChain);
    const asset = currentChain?.assets?.find(
      (item) => item.id === outgoingAsset
    );
    return asset as Asset;
  };

  const depositBitcoin = async () => {
    setIsLoading(true);
    fetch(
      `https://api.zap.zigzag.exchange/btc_deposit?outgoing_currency=${outgoingAsset}&outgoing_address=${withdrawalAddress}`
    )
      .then((res) => res.json())
      .then((res) => {
        setBitcoinDepositAddress(res.deposit_address);
      })
      .catch(() => {
        console.log("error generating btc address");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const depositSolana = async () => {
    setIsLoading(true);
    fetch(
      `https://api.zap.zigzag.exchange/sol_deposit?outgoing_currency=${outgoingAsset}&outgoing_address=${withdrawalAddress}`
    )
      .then((res) => res.json())
      .then(async (res) => {
        const connection = new solana.Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC as string
        );
        const receiver = new solana.PublicKey(res.deposit_address);
        const transaction = new solana.Transaction().add(
          solana.SystemProgram.transfer({
            fromPubkey: phantomProvider.publicKey,
            toPubkey: receiver,
            lamports: solana.LAMPORTS_PER_SOL * Number(depositAmount),
          })
        );
        transaction.feePayer = phantomProvider.publicKey;
        const blockhashObj = await connection.getRecentBlockhash();
        transaction.recentBlockhash = await blockhashObj.blockhash;
        const signedTx = await phantomProvider.signTransaction(transaction);
        const txSignature = await connection.sendRawTransaction(
          signedTx.serialize()
        );
        await connection.confirmTransaction(txSignature);
        return;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const chains: AssetChain[] = useMemo(
    () =>
      [
        {
          id: Chains.BTC,
          image: "token-icons/btc.svg",
          name: "Bitcoin",
          assets: [
            {
              id: Assets.BTC,
              name: "BTC",
              image: "token-icons/btc.svg",
              deposit: depositBitcoin,
              canDeposit: true,
              canReceive: true,
              priceMapKey: "btc_usd",
              feeDisplay: "0.1%",
              networkFeeDisplay: "~0.0001 BTC",
              requiresAddressInput: true,
              validateAddress: validateBitcoinAddress,
              availableLiquidityMapKey: "btc",
            },
          ],
        },
        {
          id: Chains.ETH,
          image: "token-icons/eth.svg",
          name: "Ethereum",
          assets: [
            {
              id: Assets.ETH,
              name: "ETH",
              image: "token-icons/eth.svg",
              deposit: depositL1Eth,
              canDeposit: true,
              canReceive: true,
              priceMapKey: "eth_usd",
              feeDisplay: "0.1%",
              networkFeeDisplay: "~0.0015 ETH",
              requiresAddressInput: true,
              validateAddress: ethers.utils.isAddress,
              requiresConnectionTo: Networks.ETH,
              availableLiquidityMapKey: "eth",
            },
          ],
        },
        {
          id: Chains.ZKSyncEra,
          image: "token-icons/zksync.svg",
          name: "zkSync Era",
          assets: [
            {
              id: Assets.ZKSyncEra,
              name: "ETH",
              image: "token-icons/eth.svg",
              deposit: depositZksyncEraEth,
              canDeposit: true,
              canReceive: true,
              priceMapKey: "eth_usd",
              feeDisplay: "0.1%",
              networkFeeDisplay: "~0.0015 ETH",
              requiresAddressInput: true,
              validateAddress: ethers.utils.isAddress,
              requiresConnectionTo: Networks.ZKSyncEra,
              availableLiquidityMapKey: "zk_sync",
            },
            {
              id: Assets.ZZTokenZKSyncEra,
              name: "ZZ",
              image: "token-icons/zz.svg",
              deposit: depositZksyncZZTokens,
              canDeposit: false,
              canReceive: true,
              priceMapKey: "zz_token_zk_sync",
              supportedDepositAssets: {
                [Chains.ZKSyncLite]: [Assets.ZZTokenZKSyncLite],
              },
              feeDisplay: "10 ZZ",
              networkFeeDisplay: "~0.0015 ETH",
              requiresAddressInput: true,
              validateAddress: ethers.utils.isAddress,
              requiresConnectionTo: Networks.ZKSyncEra,
              availableLiquidityMapKey: "zz_token_zk_sync",
              miniumDeposit: 10,
            },
          ],
        },
        {
          id: Chains.ZKSyncLite,
          image: "token-icons/zksync.svg",
          name: "zkSync Lite",
          assets: [
            {
              id: Assets.ZKSyncLite,
              name: "ETH",
              image: "token-icons/eth.svg",
              deposit: depositZksyncLiteEth,
              canDeposit: true,
              canReceive: true,
              priceMapKey: "eth_usd",
              feeDisplay: "0.1%",
              networkFeeDisplay: "~0.0015 ETH",
              requiresAddressInput: false,
              validateAddress: ethers.utils.isAddress,
              requiresConnectionTo: Networks.ZKSyncLite,
              availableLiquidityMapKey: "zk_sync_lite",
            },
            {
              id: Assets.ZZTokenZKSyncLite,
              name: "ZZ",
              image: "token-icons/zz.svg",
              deposit: depositZksyncLiteZZTokens,
              canDeposit: true,
              canReceive: false,
              priceMapKey: "zz_token_zk_sync",
              supportedOutgoingAssets: {
                [Chains.ZKSyncEra]: [Assets.ZZTokenZKSyncEra],
              },
              feeDisplay: "10 ZZ",
              networkFeeDisplay: "~0.0015 ETH",
              requiresAddressInput: false,
              validateAddress: ethers.utils.isAddress,
              requiresConnectionTo: Networks.ZKSyncLite,
              availableLiquidityMapKey: "zz_token_zk_sync_lite",
              miniumDeposit: 10,
            },
          ],
        },
        {
          id: Chains.SOL,
          image: "token-icons/sol.svg",
          name: "Solana",
          assets: [
            {
              id: Assets.SOL,
              name: "SOL",
              image: "token-icons/sol.svg",
              deposit: depositSolana,
              canDeposit: true,
              canReceive: true,
              priceMapKey: "sol_usd",
              feeDisplay: "0.1%",
              networkFeeDisplay: "~0.001 SOL",
              validateAddress: validateSolanaAddress,
              requiresAddressInput: true,
              requiresConnectionTo: Networks.SOL,
              availableLiquidityMapKey: "sol",
            },
          ],
        },
      ] as AssetChain[],
    [
      depositBitcoin,
      depositSolana,
      validateBitcoinAddress,
      validateSolanaAddress,
      ethers.utils.isAddress,
      depositL1Eth,
      depositZksyncEraEth,
      depositZksyncZZTokens,
      depositZksyncLiteEth,
      depositZksyncLiteZZTokens,
    ]
  );

  const onDepositChainChange = (chain: Chains) => {
    setDepositChain(chain);
    const chainsAssets = chains.find((item) => item.id === chain)?.assets || [];
    const newDepositAsset = chainsAssets[0].id;
    setDepositAsset(newDepositAsset);
    if (chain === Chains.ZKSyncEra) {
      setOutgoingChain(Chains.ZKSyncLite);
      if (newDepositAsset === Assets.ZKSyncEra) {
        setOutgoingAsset(Assets.ZKSyncLite);
      } else if (newDepositAsset === Assets.ZZTokenZKSyncEra) {
        setOutgoingAsset(Assets.ZZTokenZKSyncLite);
      }
    } else if (chain === Chains.ZKSyncLite) {
      setOutgoingChain(Chains.ZKSyncEra);
      if (newDepositAsset === Assets.ZKSyncLite) {
        setOutgoingAsset(Assets.ZKSyncEra);
      } else if (newDepositAsset === Assets.ZZTokenZKSyncLite) {
        setOutgoingAsset(Assets.ZZTokenZKSyncEra);
      }
    } else {
      if (
        outgoingChain === Chains.ZKSyncEra ||
        outgoingChain === Chains.ZKSyncLite
      ) {
        const otherChains = chains.filter(
          (item) =>
            item.id !== depositChain &&
            item.id !== Chains.ZKSyncEra &&
            item.id !== Chains.ZKSyncLite
        );
        setOutgoingChain(otherChains[0].id);
        setOutgoingAsset(otherChains[0].assets[0].id);
      }
    }
  };

  const onOutgoingChainChange = (chain: Chains) => {
    setOutgoingChain(chain);
    const chainAssets = chains.find((item) => item.id === chain)?.assets || [];
    const newOutgoingAsset = chainAssets[0].id;
    setOutgoingAsset(newOutgoingAsset);
    if (chain === Chains.ZKSyncEra) {
      setDepositChain(Chains.ZKSyncLite);
      if (newOutgoingAsset === Assets.ZKSyncEra) {
        setDepositAsset(Assets.ZKSyncLite);
      } else if (newOutgoingAsset === Assets.ZZTokenZKSyncEra) {
        setDepositAsset(Assets.ZZTokenZKSyncLite);
      }
    } else if (chain === Chains.ZKSyncLite) {
      setDepositChain(Chains.ZKSyncEra);
      if (newOutgoingAsset === Assets.ZKSyncLite) {
        setDepositAsset(Assets.ZKSyncEra);
      } else if (newOutgoingAsset === Assets.ZZTokenZKSyncLite) {
        setDepositAmount(Assets.ZZTokenZKSyncEra);
      }
    }
  };

  const onDepositAmountChange = (value: string) => {
    setDepositAmount(value);
    const asNumber = Number(value);
    if (isNaN(asNumber)) {
      return;
    }
    const convertedAmount = calculateOutgoingAmount(
      getCurrentDepositAsset()?.priceMapKey,
      getCurrentOutgoingAsset()?.priceMapKey,
      asNumber
    );
    if (!isNaN(convertedAmount)) {
      setOutgoingAmount(convertedAmount.toFixed(4));
    }
  };

  const onOutgoingAmountChange = (value: string) => {
    setOutgoingAmount(value);
    const asNumber = Number(value);
    if (isNaN(asNumber)) {
      return;
    }
    const convertedAmount = calculateDepositAmount(
      getCurrentDepositAsset()?.priceMapKey,
      getCurrentOutgoingAsset()?.priceMapKey,
      asNumber
    );
    if (!isNaN(convertedAmount)) {
      setDepositAmount(convertedAmount.toFixed(4));
    }
  };

  const onDepositAssetChange = (asset: Assets) => {
    setDepositAsset(asset);
    if (asset === Assets.ZZTokenZKSyncLite) {
      setOutgoingChain(Chains.ZKSyncEra);
      setOutgoingAsset(Assets.ZZTokenZKSyncEra);
    }
  };

  const onOutgoingAssetChange = (asset: Assets) => {
    setOutgoingAsset(asset);
    if (asset === Assets.ZZTokenZKSyncEra) {
      setDepositChain(Chains.ZKSyncLite);
      setDepositAsset(Assets.ZZTokenZKSyncLite);
    }
  };

  const swapAssets = () => {
    onDepositChainChange(outgoingChain);
    onOutgoingChainChange(depositChain);
    onDepositAssetChange(outgoingAsset);
    onOutgoingAssetChange(depositAsset);
  };

  return (
    <BridgeContext.Provider
      value={{
        depositChain,
        setDepositChain: onDepositChainChange,
        outgoingChain,
        setOutgoingChain: onOutgoingChainChange,
        depositAsset,
        setDepositAsset: onDepositAssetChange,
        outgoingAsset,
        setOutgoingAsset: onOutgoingAssetChange,
        depositAmount,
        setDepositAmount: onDepositAmountChange,
        outgoingAmount,
        setOutgoingAmount: onOutgoingAmountChange,
        chains,
        swapAssets,
        getCurrentDepositAsset,
        getCurrentOutgoingAsset,
        withdrawalAddress,
        setWithdrawalAddress,
        isLoading: isLoading || isEvmTxLoading,
        bitcoinDepositAddress,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
}

export { BridgeProvider, BridgeContext };
