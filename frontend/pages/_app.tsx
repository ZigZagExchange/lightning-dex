import "../styles/globals.css"
import "../styles/styles.scss"
import type { AppProps } from "next/app"

import WalletProvider from "../contexts/WalletContext"
import ExchangeProvider from "../contexts/ExchangeContext"
import SwapProvider from "../contexts/SwapContext"
import { ToastContainer } from 'react-toastify'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <ExchangeProvider>
        <SwapProvider>
          <Component {...pageProps} />
          <ToastContainer />
        </SwapProvider>
      </ExchangeProvider>
    </WalletProvider>
  )
}

export default MyApp
