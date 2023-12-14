import "../styles/globals.css";
import "../styles/styles.scss";
import type { AppProps } from "next/app";
import { WagmiConfig } from "wagmi";
import { ToastContainer } from "react-toastify";
import configWagmi from "../config/wagmi";
import { WalletProvider } from "../contexts/wallet-context";
import { BalanceProvider } from "../contexts/balance-context";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={configWagmi}>
      <WalletProvider>
        <BalanceProvider>
          <Component {...pageProps} />
          <ToastContainer theme="dark" />
        </BalanceProvider>
      </WalletProvider>
    </WagmiConfig>
  );
}

export default MyApp;
