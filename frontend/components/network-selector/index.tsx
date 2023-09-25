import styles from "./network-selector.module.css";
import { useWallet } from "../../hooks/use-wallet";
import { useBalance } from "../../hooks/use-balance";

function NetworkSelector({
  networkSelectorModalOpen,
}: {
  networkSelectorModalOpen: () => void;
}) {
  const { isConnected } = useWallet();
  const { balanceFormatted } = useBalance();

  function open() {
    networkSelectorModalOpen();
  }

  return isConnected ? (
    <div className={`lg:flex hidden ${styles.container}`}>
      <div className={styles.connect_button} onClick={open}>
        <div className={styles.text}>{balanceFormatted}</div>
      </div>
    </div>
  ) : (
    <></>
  );
}

export default NetworkSelector;
