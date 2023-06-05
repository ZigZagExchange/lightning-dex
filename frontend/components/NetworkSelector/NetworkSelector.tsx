import { useContext } from 'react'
import { WalletContext } from '../../contexts/WalletContext'
import styles from "./NetworkSelector.module.css"

function NetworkSelector(
  { networkSelectorModalOpen }: { networkSelectorModalOpen: () => void }
) {
  const { balance, isConnected } = useContext(WalletContext)

  function open() {
    networkSelectorModalOpen()
  }

  return (
    isConnected !== null && balance ? (
      <div className={`lg:flex hidden ${styles.container}`}>
        <div className={styles.connect_button} onClick={open}>
          <div className={styles.text}>
            {balance}
          </div>
        </div>
      </div>
    ) : (
      <></>
    )
  )
}

export default NetworkSelector