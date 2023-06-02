import { useEffect, useState, useContext } from "react"
import { WalletContext } from "../../contexts/WalletContext"
import formatAddress from "../../utils/formatAddress"
import styles from "./ConnectWallet.module.css"

function ConnectWallet(
  { openConnectWalletModal }: { openConnectWalletModal: () => void }
) {
  const { address, isConnected } = useContext(WalletContext)
  const [text, setText] = useState("Connect Wallet")

  useEffect(() => {
    if (address && isConnected) {
      setText(formatAddress(address))
    } else {
      setText("Connect Wallet")
    }
  }, [address, isConnected])

  function open() {
    openConnectWalletModal()
  }

  return (
    <div className={`lg:flex hidden ${styles.container}`}>
      <button className={styles.connect_button} onClick={open}>
        <div className={styles.text}>{text}</div>
      </button>
    </div>
  )
}

export default ConnectWallet