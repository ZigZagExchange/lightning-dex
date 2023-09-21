import "../styles/globals.css";
import "../styles/styles.scss";
import type { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { ToastContainer } from "react-toastify";
import configWagmi from "../config/wagmi";
import { WalletProvider } from "../contexts/wallet-context";
import { BalanceProvider } from "../contexts/balance-context";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={configWagmi}>
      <WalletProvider>
        <BalanceProvider>
          <Component {...pageProps} />
          <ToastContainer />
        </BalanceProvider>
      </WalletProvider>
    </WagmiConfig>
  );
}

export default MyApp;
