import { useContext } from "react";
import { WalletContext } from "../contexts/wallet-context";

function useWallet() {
  const context = useContext(WalletContext);
  return context;
}

export { useWallet };
