import { utils } from "ethers"
import Image from "next/image"
import { useContext, useEffect } from "react"
import { ExchangeContext, ZZTokenInfo } from "../../../../contexts/ExchangeContext"
import { SwapContext } from "../../../../contexts/SwapContext"
import useCountdown from "../../../../hooks/useCountdown"
import { parseError, prettyBalance } from "../../../../utils/utils"
import TransactionProgress from "../../../transactionProgress/TransactionProgress"
import { rightArrow } from "../../modal/Modal"
import styles from "./UnwrapModal.module.css"

interface Props {
  close: () => void
}

export default function UnwrapModal({ close }: Props) {
  const { buyTokenInfo, sellTokenInfo } = useContext(ExchangeContext)
  const { transactionStatus, transactionError, sellAmount, buyAmount } = useContext(SwapContext)

  const errorMessage = transactionError ? parseError(transactionError) : undefined

  let message
  if (transactionStatus === "awaitingWallet") {
    message = "Awaiting wallet confirmation..."
  } else if (transactionStatus === "processing") {
    message = "Transaction confirmed. Processing..."
  } else {
    message = "Token swapped."
  }

  if (buyTokenInfo && sellTokenInfo)
    return (
      <div className={styles.container}>
        <div className={styles.title}>
          Swapping {sellTokenInfo.symbol} for {buyTokenInfo.symbol}
        </div>
        <hr className={styles.hr} />
        <div className={styles.transaction_progress_container}>
          <TransactionProgress status={transactionStatus} failed={transactionError !== null} />
        </div>
        <div className={styles.buy_sell_tokens}>
          <div className={styles.sell_token}>
            {prettyBalance(utils.formatUnits(sellAmount, sellTokenInfo.decimals))}{" "}
            <div className={styles.token_symbol}>
              <Image 
                src={`/tokenIcons/${sellTokenInfo.symbol.toLocaleLowerCase()}.svg`} 
                alt={sellTokenInfo.symbol}
                width="35"
                height="35"
                layout="intrinsic"
              />
            </div>
          </div>
          <div className={styles.arrow}>{rightArrow}</div>
          <div className={styles.buy_token}>
            {prettyBalance(utils.formatUnits(buyAmount, buyTokenInfo.decimals))}
            <div className={styles.token_symbol}>
              <Image
                src={`/tokenIcons/${buyTokenInfo.symbol.toLocaleLowerCase()}.svg`}
                alt={buyTokenInfo.symbol}
                width="35"
                height="35"
                layout="intrinsic"
              />
            </div>
          </div>
        </div>
        <div className={styles.text}>{errorMessage ? errorMessage : message}</div>
      </div>
    )
  else return <div>Error: buyTokenInfo is missing</div>
}
