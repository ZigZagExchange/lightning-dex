import { useContext } from "react";
import { BridgeContext } from "../contexts/bridge-context";

function useBridge() {
  const context = useContext(BridgeContext);
  return context;
}

export { useBridge };
