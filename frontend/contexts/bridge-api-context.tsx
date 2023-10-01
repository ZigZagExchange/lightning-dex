import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { useWallet } from "../hooks/use-wallet";

interface USDPriceMap {
  [key: string]: number;
}

interface AvailableLiquidityMap {
  [key: string]: number;
}

interface BridgeHistoryRecord {
  deposit_currency: string;
  deposit_address: string;
  deposit_txid: string;
  deposit_timestamp: string;
  outgoing_currency: string;
  outgoing_address: string;
  outgoing_amount: string;
  outgoing_txid: string;
  outgoing_timestamp: string;
  paid: boolean;
  fee: string;
}

interface BridgeApiContext {
  calculateOutgoingAmount: (
    depositAssetKey: string,
    outgoingAssetKey: string,
    depositAmount: number
  ) => number;
  calculateDepositAmount: (
    depositAssetKey: string,
    outgoingAssetKey: string,
    outgoingAmount: number
  ) => number;
  getUsdPrice: (assetKey: string) => number;
  hasSufficientLiquidity: (assetKey: string, value: number) => boolean;
}

const BridgeApiContext = createContext<BridgeApiContext>({
  calculateOutgoingAmount: () => 0,
  calculateDepositAmount: () => 0,
  getUsdPrice: () => 0,
  hasSufficientLiquidity: () => false,
});

function BridgeApiProvider({ children }: PropsWithChildren) {
  const [usdPriceMap, setUsdPriceMap] = useState<USDPriceMap>({});
  const [availableLiquidityMap, setAvailableLiquidityMap] =
    useState<AvailableLiquidityMap>({});
  const { connectedWallet } = useWallet();
  const [addressHistory, setAddressHistory] = useState<BridgeHistoryRecord[]>(
    []
  );

  useEffect(() => {
    refreshPrices();
    refreshAvailableLiquidity();

    const interval = setInterval(() => {
      refreshPrices();
      refreshAvailableLiquidity();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refreshAddressHistory();
  }, [connectedWallet?.address]);

  const refreshPrices = () => {
    fetch("https://api.zap.zigzag.exchange/prices")
      .then((res) => res.json())
      .then((res) => {
        setUsdPriceMap(res);
      })
      .catch(() => {
        console.log("error fetching prices");
      });
  };

  const refreshAvailableLiquidity = () => {
    fetch("https://api.zap.zigzag.exchange/available_liquidity")
      .then((res) => res.json())
      .then((res) => {
        setAvailableLiquidityMap(res);
      })
      .catch(() => {
        console.log("error fetching available liquidity");
      });
  };

  const refreshAddressHistory = () => {
    fetch(`https://api.zap.zigzag.exchange/history/${connectedWallet?.address}`)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
      })
      .catch(() => {
        console.log("error fetching address history");
      });
  };

  const calculateOutgoingAmount = (
    depositAssetKey: string,
    outgoingAssetKey: string,
    depositAmount: number
  ) => {
    const depositAssetPrice = usdPriceMap[depositAssetKey] || 0;
    const outgoingAssetPrice = usdPriceMap[outgoingAssetKey] || 0;
    const depositInUsd = depositAmount * depositAssetPrice;
    return depositInUsd / outgoingAssetPrice;
  };

  const calculateDepositAmount = (
    depositAssetKey: string,
    outgoingAssetKey: string,
    outgoingAmount: number
  ) => {
    const depositAssetPrice = usdPriceMap[depositAssetKey] || 0;
    const outgoingAssetPrice = usdPriceMap[outgoingAssetKey] || 0;
    const outgoingInUsd = outgoingAmount * outgoingAssetPrice;
    return outgoingInUsd / depositAssetPrice;
  };

  const getUsdPrice = (assetKey: string) => {
    return usdPriceMap[assetKey] || 0;
  };

  const hasSufficientLiquidity = (assetKey: string, value: number) => {
    const targetLiquidity = availableLiquidityMap[assetKey] || 0;
    return targetLiquidity > value;
  };

  return (
    <BridgeApiContext.Provider
      value={{
        calculateOutgoingAmount,
        calculateDepositAmount,
        getUsdPrice,
        hasSufficientLiquidity,
      }}
    >
      {children}
    </BridgeApiContext.Provider>
  );
}

export { BridgeApiProvider, BridgeApiContext };
