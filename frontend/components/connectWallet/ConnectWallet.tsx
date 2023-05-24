import { useEffect, useState } from "react"
import styles from "./ConnectWallet.module.css"
import { useAccount } from 'wagmi'

function ConnectWallet({ openConnectWalletModal }: { openConnectWalletModal: () => void }) {
  const account = useAccount()
  const [text, setText] = useState("Connect Wallet")

  useEffect(() => {
    // if (account.address) {
    //   setText(formatAddress(account.address))
    // }
  }, [account])

  function open() {
    openConnectWalletModal()
  }

  function formatAddress(address: string) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length)
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