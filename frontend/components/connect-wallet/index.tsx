import { useEffect, useState } from "react";
import styles from "./connect-wallet.module.css";
import { useWallet } from "../../hooks/use-wallet";
import formatAddress from "../../utils/format-address";

function ConnectWallet({ onClick }: { onClick: () => void }) {
  const [text, setText] = useState("Connect Wallet");
  const { connectedWallet } = useWallet();

  useEffect(() => {
    if (connectedWallet?.address) {
      setText(formatAddress(connectedWallet?.address));
    } else {
      setText("Connect Wallet");
    }
  }, [connectedWallet?.address]);

  return (
    <div className={`lg:flex hidden ${styles.container}`}>
      <button className={styles.connect_button} onClick={onClick}>
        <div className={styles.text}>{text}</div>
      </button>
    </div>
  );
}

export default ConnectWallet;
