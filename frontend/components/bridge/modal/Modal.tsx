import { useRef, useEffect } from "react"
import styles from "./Modal.module.css"
import ConnectWalletModal from "../modals/connectWalletModal/ConnectWalletModal"
import NetworkSelectorModal from "../modals/networkSelectorModal/NetworkSelectorModal"

export type ModalMode = "connectWallet" | "network" | null

interface Props {
  selectedModal: ModalMode
  onTokenClick: (tokenAddress: string) => void
  close: () => void
}

export default function Modal({ selectedModal, onTokenClick, close }: Props) {
  const container_ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isOpen = selectedModal !== null
    const close = (e: any) => {
      if (e.key === "Escape") {
        close_modal()
      }
    }
    if (isOpen) window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [selectedModal])

  function close_modal() {
    close()
  }

  if (selectedModal === "connectWallet") {
    return (
      <div
        className={`${styles.container} ${!selectedModal ? styles.hidden : ""}`}
        onClick={e => (e.target === container_ref.current ? close_modal() : null)}
        ref={container_ref}
      >
        <div className={`${styles.modal} ${styles.wallet_modal}`}>
          <ConnectWalletModal close={close_modal} />
        </div>
      </div>
    )
  } else if (selectedModal === "network") {
    return (
      <div
        className={`${styles.container} ${!selectedModal ? styles.hidden : ""}`}
        onClick={e => (e.target === container_ref.current ? close_modal() : null)}
        ref={container_ref}
      >
        <div className={`${styles.modal} ${styles.wallet_modal}`}>
          <NetworkSelectorModal close={close_modal} />
        </div>
      </div>
    )
  } else return <></>
}

export const rightArrow = (
  <svg viewBox="0 0 490 490" height="1em">
    <path d="M15.541,490V0l458.917,245.009L15.541,490z" />
  </svg>
)
