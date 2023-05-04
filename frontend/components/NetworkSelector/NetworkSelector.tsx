import { useContext } from "react"

import Jazzicon, { jsNumberForAddress } from "react-jazzicon"

import { WalletContext } from "../../contexts/WalletContext"

import styles from "./NetworkSelector.module.css"
import DownArrow from "../DownArrow"
import { hideAddress } from "../../utils/utils"

function NetworkSelector({ networkSelectorModalOpen }: { networkSelectorModalOpen: () => void }) {
  const { userAddress, username, network, connect, disconnect } = useContext(WalletContext)

  function open() {
    networkSelectorModalOpen()
  }

  if (!userAddress) {
    return (
      <div className={`lg:flex hidden ${styles.container}`}>
        <button className={styles.connect_button} onClick={open}>
          <div className={styles.text}>0.0 ETH</div>
        </button>
      </div>
    )
  } else {
    let usernameOrAddress
    if (username) {
      usernameOrAddress = <div className={styles.username}>{username}</div>
    } else if (userAddress) {
      usernameOrAddress = <div className={styles.address}>{hideAddress(userAddress)}</div>
    }

    return (
      <div className={styles.container} onMouseEnter={open}>
        <div className={styles.profile_button}>
          <div className={styles.profile_image_container}>
            <Jazzicon diameter={30} seed={jsNumberForAddress(userAddress)} />
          </div>
          <div className={styles.username_address_container}>{usernameOrAddress}</div>
          <div className={styles.arrow}>
            <DownArrow />
          </div>
        </div>
      </div>
    )
  }
}

export default NetworkSelector