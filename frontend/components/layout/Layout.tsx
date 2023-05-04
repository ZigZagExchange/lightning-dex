/** @format */

import { ReactNode, useState, useContext, useEffect } from "react"

import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"

import { WalletContext } from "../../contexts/WalletContext"

import logo from "../../public/img/zz.svg"
// import logo from "./logo.png"

import styles from "./Layout.module.css"
import FooterSocials from "../footerSocials/FooterSocials"
import ConnectWallet from "../connectWallet/ConnectWallet"
import NetworkSelector from "../NetworkSelector/NetworkSelector"
import MobileMenu from "../MobileMenu/MobileMenu"
import GroupButtonDropdown from "../GroupButtonDropdown/GroupButtonDropdown"
import HeaderSocials from "../HeaderSocials/HeaderSocials"
import NavBar from "../navBar/NavBar"
import Modal, { ModalMode } from "../swap/modal/Modal"


interface Props {
  children?: ReactNode
}

function Layout(props: Props) {
  const { userAddress, network, ethersProvider } = useContext(WalletContext)
  const [headerWarning, setHeaderWarning] = useState<JSX.Element | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [modal, setModal] = useState<ModalMode>(null)

  const router = useRouter()

  useEffect(() => {
    if (ethersProvider && network) {
      ethersProvider.getNetwork().then(proivderNetwork => {
        if (proivderNetwork.chainId === network.networkId) {
          setHeaderWarning(null)
          return
        }
      })
    }
    if (userAddress) {
      setHeaderWarning(
        <div className={styles.header_warning_container}>
          <strong>{"Please change the Network"}</strong> <span>{"Please change the Network"}</span>
        </div>
      )
    }
    setHeaderWarning(null)
  }, [ethersProvider, network])

  const handleTokenClick = (newTokenAddress: string) => {
    setModal(null)
  }

  let headerLeft = (
    <nav className={`${styles.header_left} lg:mr-[5rem]`}>
      {/* <Link href="/"> */}
      {/* <a className={`${styles.nav_link}`}> */}
      <span className={`${styles.icon}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <Image src={logo} alt="logo" width="30" height={"50"} />
      </span>
      {/* </a> */}
      {/* </Link> */}
      <Link href="https://arbitrum.zigzag.exchange/" className={`${styles.nav_link} ${styles.named_nav_link} ${router.route === "/trade" ? styles.active_nav_link : ""}`}>
        Order Book
      </Link>
      {/* <Link href="/">
          <a className={`${styles.nav_link} ${styles.named_nav_link} ${router.route === "/swap" ? styles.active_nav_link : ""}`}>Swap</a>
        </Link> */}

      {/* Link */}
      {/* <HeaderSocials /> */}
      {/* <NetworkSelector /> */}
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
        {headerWarning}
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
          openConnectWalletModal={() => { setModal("connectWallet") }} />
      </header>
      {/* <div className={styles.mobile_nav}>
        <Link href="https://arbitrum.zigzag.exchange/">
          <a className={`${styles.nav_link} ${styles.named_nav_link} ${router.route === "/trade" ? styles.active_nav_link : ""}`}>Orderbook</a>
        </Link>
        <Link href="/">
          <a className={`${styles.nav_link} ${styles.named_nav_link} ${router.route === "/swap" ? styles.active_nav_link : ""}`}>Swap</a>
        </Link>
      </div> */}
      <main className={styles.content}>{props.children}</main>
      <footer className={styles.footer}>
        <FooterSocials />
      </footer>

      <Modal selectedModal={modal} onTokenClick={(tokenAddress: string) => handleTokenClick(tokenAddress)} close={() => setModal(null)} />
    </>
  )
}

export default Layout
