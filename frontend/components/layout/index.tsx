import { useState, PropsWithChildren } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import logo from "../../public/img/zz.svg";
import styles from "./layout.module.css";
import FooterSocials from "../footer-socials";
import ConnectWallet from "../connect-wallet";
import NetworkSelector from "../network-selector";
import MobileMenu from "../mobile-menu";
import GroupButtonDropdown from "../group-button-dropdown";
import Modal from "../modal";
import { useWallet } from "../../hooks/use-wallet";
import { NetworkConfig } from "../../contexts/wallet-context";
import ListOption from "../list-option";

function Layout(props: PropsWithChildren) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isConnectWalletModalOpen, setIsConnectWalletModalOpen] =
    useState(false);
  const { networks } = useWallet();
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>();

  const headerLeft = (
    <nav className={`${styles.header_left} lg:mr-[5rem]`}>
      <span
        className={`${styles.icon}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Image src={logo} alt="logo" width="30" height={"50"} />
      </span>
      <Link
        href="https://trade.zigzag.exchange/"
        className={`${styles.nav_link} ${styles.named_nav_link} ${
          router.route === "/trade" ? styles.active_nav_link : ""
        }`}
      >
        Order Book
      </Link>
      <Link
        href="/liquidity"
        className={`${styles.nav_link} ${styles.named_nav_link} ${
          router.route === "/trade" ? styles.active_nav_link : ""
        }`}
      >
        Provide Liquidity
      </Link>
    </nav>
  );

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

      <header
        className={`${styles.header} ${styles.mobile} ${
          isMenuOpen ? styles.menu_open : ""
        } py-10 xl:px-28 lg:px-14 px-5 md:px-28`}
      >
        {headerLeft}
        <div className={styles.header_right}>
          <NetworkSelector
            networkSelectorModalOpen={() => {
              setIsConnectWalletModalOpen(true);
            }}
          />
          <ConnectWallet onClick={() => setIsConnectWalletModalOpen(true)} />
          <GroupButtonDropdown />
        </div>

        <MobileMenu
          networkSelectorModalOpen={() => {
            //setModal("network");
          }}
          openConnectWalletModal={() => {
            //setModal("connectWallet");
          }}
        />
      </header>

      <main className={styles.content}>{props.children}</main>

      <footer className={styles.footer}>
        <FooterSocials />
      </footer>

      <Modal
        isVisible={isConnectWalletModalOpen}
        onClose={() => setIsConnectWalletModalOpen(false)}
        title="Connect Wallet"
      >
        {selectedNetwork
          ? selectedNetwork.connectors.map((item, index) => (
              <ListOption
                key={index}
                label={item.name}
                icon={item.image}
                onClick={() => {
                  if (item.name === "Wallet Connect") {
                    setIsConnectWalletModalOpen(false);
                  }
                  item
                    .connect()
                    .then(() => {
                      setSelectedNetwork(undefined);
                      setIsConnectWalletModalOpen(false);
                    })
                    .catch(() => null);
                }}
              />
            ))
          : networks.map((item, index) => (
              <ListOption
                key={index}
                label={item.name}
                icon={item.image}
                onClick={() => setSelectedNetwork(item)}
              />
            ))}
        {selectedNetwork && (
          <div
            onClick={() => setSelectedNetwork(undefined)}
            className="cursor-pointer"
          >
            <p className="text-center opacity-50 hover:underline mt-2">Back</p>
          </div>
        )}
      </Modal>
    </>
  );
}

export default Layout;
