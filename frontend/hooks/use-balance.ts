import { useContext } from "react";
import { BalanceContext } from "../contexts/balance-context";

function useBalance() {
  const context = useContext(BalanceContext);
  return context;
}

export { useBalance };
