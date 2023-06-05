import { ReactNode, useState, useEffect, useContext } from "react"
import { toast } from 'react-toastify'
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"
import { useAccount, useBalance, useConnect, useDisconnect, Connector } from "wagmi"
import { PublicKey } from '@solana/web3.js'

import logo from "../../public/img/zz.svg"
import styles from "./Layout.module.css"
import FooterSocials from "../footerSocials/FooterSocials"
import ConnectWallet from "../connectWallet/ConnectWallet"
import NetworkSelector from "../NetworkSelector/NetworkSelector"
import MobileMenu from "../MobileMenu/MobileMenu"
import GroupButtonDropdown from "../GroupButtonDropdown/GroupButtonDropdown"
import NavBar from "../navBar/NavBar"
import Modal, { ModalMode } from "../bridge/modal/Modal"
import { WalletContext } from "../../contexts/WalletContext"
import { networksItems } from "../../utils/data"
import { Chain } from "../../contexts/WalletContext"
import usePhantom from "../../hooks/usePhantom"

interface Balance {
  address: `0x${string}` | undefined
  token?: `0x${string}`
  chainId?: number
}
interface LayoutProps {
  children?: ReactNode
}

function Layout(props: LayoutProps) {
  const router = useRouter()
  const { isConnected: isConnectedMetaMask, address } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { phantomProvider } = usePhantom()

  const {
    chain,
    isConnected,
    orgChainId,
    updateAddress,
    updateBalance,
    updateIsLoading,
    updateIsConnected,
  } = useContext(WalletContext)

  const token = networksItems.filter((item) => item.id === orgChainId)

  const option: Balance = orgChainId === 1 ? {
    address,
    chainId: orgChainId,
  } : {
    address,
    token: `0x${token[0].token}`,
  }

  const { data, isSuccess } = useBalance(option)

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [modal, setModal] = useState<ModalMode>(null)

  // useEffect(() => {
  //   // @ts-ignore
  //   if (typeof window.ethereum !== 'undefined') {
  //     // @ts-ignore
  //     if (window.ethereum.isConnected() && chain === Chain.evm && !isConnected) {
  //       handleAutoConnectMetaMask(connectors[0])
  //     }
  //   }
  // }, [])

  useEffect(() => {
    if (isConnectedMetaMask && address && data && isSuccess) {
      updateIsConnected('MataMask')
      updateAddress(address)
      updateBalance(`${parseFloat(data.formatted).toFixed(2)} ${data.symbol}`)
    }
  }, [address, data, isConnectedMetaMask, isSuccess])

  // const handleAutoConnectMetaMask = async (connector: Connector) => {
  //   try {
  //     updateIsLoading(true)
  //     if (phantomProvider) {
  //       await phantomProvider.disconnect()
  //     }
  //     // @ts-ignore
  //     if (typeof window.ethereum !== 'undefined') {
  //       // @ts-ignore
  //       if (window.ethereum.isConnected()) {
  //         await disconnectAsync()
  //         await connectAsync({ connector })
  //       }
  //     }
  //     updateIsConnected('MataMask')
  //   } catch (err: any) {
  //     console.log(err?.message || err)
  //   } finally {
  //     updateIsLoading(false)
  //     close()
  //   }
  // }

  const handleTokenClick = (newTokenAddress: string) => {
    setModal(null)
  }

  const headerLeft = (
    <nav className={`${styles.header_left} lg:mr-[5rem]`}>
      <span className={`${styles.icon}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <Image src={logo} alt="logo" width="30" height={"50"} />
      </span>
      <Link
        href="https://arbitrum.zigzag.exchange/"
        className={`${styles.nav_link} ${styles.named_nav_link} ${router.route === "/trade" ? styles.active_nav_link : ""}`}
      >
        Order Book
      </Link>
    </nav>
  )

  return (
    <>
      <div className={styles.bg}>
        <div className={styles.lines_container}>
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
        </div>
      </div>

      <header className={`${styles.header} ${styles.mobile} ${isMenuOpen ? styles.menu_open : ""} py-10 xl:px-28 lg:px-14 px-5 md:px-28`}>
        {headerLeft}

        <NavBar />

        <div className={styles.header_right}>
          <NetworkSelector networkSelectorModalOpen={() => { setModal("network") }} />
          <ConnectWallet openConnectWalletModal={() => { setModal("connectWallet") }} />
          {modal}
          <GroupButtonDropdown />
        </div>

        <MobileMenu
          networkSelectorModalOpen={() => { setModal("network") }}
          openConnectWalletModal={() => { setModal("connectWallet") }}
        />
      </header>

      <main className={styles.content}>
        {props.children}
      </main>

      <footer className={styles.footer}>
        <FooterSocials />
      </footer>

      <Modal
        selectedModal={modal}
        onTokenClick={(tokenAddress: string) => handleTokenClick(tokenAddress)}
        close={() => setModal(null)}
      />
    </>
  )
}

export default Layout
