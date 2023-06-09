import "../styles/globals.css"
import "../styles/styles.scss"
import type { AppProps } from "next/app"
import { WagmiConfig } from 'wagmi'
import WalletProvider from "../contexts/WalletContext"
import { ToastContainer } from 'react-toastify'
import configWagmi from '../config/wagmi'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={configWagmi}>
      <WalletProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </WalletProvider>
    </WagmiConfig>
  )
}

export default MyApp
