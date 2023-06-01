import { ReactNode, useState } from "react"

import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"

import logo from "../../public/img/zz.svg"

import styles from "./Layout.module.css"
import FooterSocials from "../footerSocials/FooterSocials"
import ConnectWallet from "../connectWallet/ConnectWallet"
import NetworkSelector from "../NetworkSelector/NetworkSelector"
import MobileMenu from "../MobileMenu/MobileMenu"
import GroupButtonDropdown from "../GroupButtonDropdown/GroupButtonDropdown"
import NavBar from "../navBar/NavBar"
import Modal, { ModalMode } from "../bridge/modal/Modal"


interface Props {
  children?: ReactNode
}

function Layout(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [modal, setModal] = useState<ModalMode>(null)

  const router = useRouter()

  const handleTokenClick = (newTokenAddress: string) => {
    setModal(null)
  }

  let headerLeft = (
    <nav className={`${styles.header_left} lg:mr-[5rem]`}>
      <span className={`${styles.icon}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <Image src={logo} alt="logo" width="30" height={"50"} />
      </span>
      <Link href="https://arbitrum.zigzag.exchange/" className={`${styles.nav_link} ${styles.named_nav_link} ${router.route === "/trade" ? styles.active_nav_link : ""}`}>
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
          openConnectWalletModal={() => { setModal("connectWallet") }} />
      </header>

      <main className={styles.content}>{props.children}</main>
      <footer className={styles.footer}>
        <FooterSocials />
      </footer>

      <Modal selectedModal={modal} onTokenClick={(tokenAddress: string) => handleTokenClick(tokenAddress)} close={() => setModal(null)} />
    </>
  )
}

export default Layout
