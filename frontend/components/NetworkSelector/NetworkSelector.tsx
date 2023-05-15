import { useContext, useEffect, useState } from "react"
import { useAtom } from "jotai/react"

import Jazzicon, { jsNumberForAddress } from "react-jazzicon"

import { WalletContext } from "../../contexts/WalletContext"

import styles from "./NetworkSelector.module.css"
import DownArrow from "../DownArrow"
import { hideAddress } from "../../utils/utils"

import { originTokenAtom } from "../../store/token"
import { networksItems } from "../../utils/data"

function NetworkSelector({ networkSelectorModalOpen }: { networkSelectorModalOpen: () => void }) {
  const { userAddress, username, network, connect, disconnect } = useContext(WalletContext)
  const [originToken, setOriginToken] = useAtom(originTokenAtom)
  const [tokenIcon, setTokenIcon] = useState<string>("")

  useEffect(() => {
    let icon = networksItems.filter(item => item.name === originToken)[0].icon
    setTokenIcon(icon)
  }, [originToken])

  function open() {
    networkSelectorModalOpen()
  }

  if (!userAddress) {
    return (
      <div className={`lg:flex hidden ${styles.container}`}>
        <button className={styles.connect_button} onClick={open}>
          <div className={styles.text}>
            0.0 ETH
            <Image src={`/tokenIcons/${tokenIcon}`} alt="Switch Network" className="w-5 h-5 ml-2 rounded-full" width={20} height={20} />
          </div>
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
import { useAmp } from "next/amp"
import Image from "next/image"

export default NetworkSelector