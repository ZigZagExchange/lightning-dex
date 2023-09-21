import { useContext } from "react";
import { BridgeApiContext } from "../contexts/bridge-api-context";

function useBridgeApi() {
  const context = useContext(BridgeApiContext);
  return context;
}

export { useBridgeApi };
