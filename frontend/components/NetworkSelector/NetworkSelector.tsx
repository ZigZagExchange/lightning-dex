import { useAccount, useBalance } from 'wagmi'
import styles from "./NetworkSelector.module.css"
import { useEffect, useState } from 'react'

function NetworkSelector({ networkSelectorModalOpen }: { networkSelectorModalOpen: () => void }) {
  const [userBalance, setUserBalance] = useState<any>(null)
  const account = useAccount()

  const balance = useBalance({
    address: account.address
  })

  useEffect(() => {
    setUserBalance(balance)
  }, [balance.isLoading])

  if (!account.address) return <></>


  function open() {
    networkSelectorModalOpen()
  }

  if (balance.isLoading) return <div>Fetching balance…</div>
  if (balance.isError) return <div>Error fetching balance</div>

  return (
    userBalance ? <div className={`lg:flex hidden ${styles.container}`}>
      <div className={styles.connect_button} onClick={open}>
        <div className={styles.text}>
          {parseFloat(userBalance?.data?.formatted as string).toFixed(2)}&nbsp;

          {userBalance?.data?.symbol}
        </div>
      </div>
    </div> : <></>
  )
}
export default NetworkSelector