import { useAccount, useBalance } from 'wagmi'
import styles from "./NetworkSelector.module.css"

function NetworkSelector({ networkSelectorModalOpen }: { networkSelectorModalOpen: () => void }) {
  const account = useAccount()

  const balance = useBalance({
    address: account.address
  })

  if (!account.address) return <></>

  function open() {
    networkSelectorModalOpen()
  }

  if (balance.isLoading) return <div>Fetching balance…</div>
  if (balance.isError) return <div>Error fetching balance</div>

  return (
    <div className={`lg:flex hidden ${styles.container}`}>
      <button className={styles.connect_button} onClick={open}>
        <div className={styles.text}>
          {parseFloat(balance.data?.formatted as string).toFixed(2)}&nbsp;

          {balance.data?.symbol}
        </div>
      </button>
    </div>
  )
}
export default NetworkSelector