import styles from "./ConnectWallet.module.css"
import { useAccount } from 'wagmi'

function ConnectWallet({ openConnectWalletModal }: { openConnectWalletModal: () => void }) {
  const account = useAccount()

  function open() {
    openConnectWalletModal()
  }

  function formatAddress(address: string) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length)
  }

  return (
    <div className={`lg:flex hidden ${styles.container}`}>
      <button className={styles.connect_button} onClick={open}>
        {
          !account.address ?
            <div className={styles.text}>Connect Wallet</div>
            :
            <div className={styles.text}>{formatAddress(account.address)}</div>
        }
      </button>
    </div>
  )
}

export default ConnectWallet