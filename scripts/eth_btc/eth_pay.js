import { ethers } from 'ethers'
import dotenv from 'dotenv'
import pg from 'pg'
import fetch from 'node-fetch'

dotenv.config()

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: 'postgres'
});

const ethersProvider = new ethers.providers.InfuraProvider(
    process.env.ETH_NETWORK,
    process.env.INFURA_PROJECT_ID,
);
const ethWallet = new ethers.Wallet(process.env.ETH_PRIVKEY, ethersProvider);

makePayments();

const gmx_tokens = {
  "BTC": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  "ETH": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
}

async function makePayments() {
  const result = await db.query("SELECT * FROM bridges WHERE paid=false AND outgoing_currency = 'ETH' AND outgoing_address IS NOT NULL AND deposit_currency='BTC'");
  if (result.rows.length === 0) {
    setTimeout(makePayments, 5000);
    return;
  }

  const prices = await fetch("https://api.gmx.io/prices").then(response => response.json());

  let feeData; 
  try {
    feeData = await ethersProvider.getFeeData();
    if (!feeData.gasPrice) throw new Error(feeData)
  } catch (e) {
    console.error("Error getting ETH fee data");
    console.error(e);
    setTimeout(makePayments, 5000);
    return;
  }
  const network_fee = feeData.gasPrice.mul(21000).mul(2);

  for (let bridge of result.rows) {
    const btc_price = prices[gmx_tokens.BTC] / 1e30;
    const eth_price = prices[gmx_tokens.ETH] / 1e30;
    const eth_btc_price = eth_price / btc_price;
    if (typeof eth_btc_price !== "number" || isNaN(eth_btc_price)) throw new Error("ethbtc price is invalid");
    if (eth_btc_price > 0.1 || eth_btc_price < 0.04) throw new Error("ethbtc price failed sanity check");

    let makerBalance;
    try {
      makerBalance = await ethersProvider.getBalance(ethWallet.address);
    } catch (e) {
      console.error("Error getting maker balance")
      console.error(e);
      break;
    }

    const outgoing_amount = ethers.BigNumber.from((bridge.deposit_amount * 0.998 * btc_price / eth_price * 1e18).toFixed(0)).sub(network_fee)
    if (makerBalance.lt(outgoing_amount)) continue;

    const update_paid = await db.query("UPDATE bridges SET paid=true WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (update_paid.rowCount !== 1) throw new Error("Weird failure in paid update");

    if (outgoing_amount.lte(0)) {
      console.log("Payment skipped. Outgoing amount would be negative");
      continue;
    }

    let eth_payment;
    try {
      eth_payment = await ethWallet.sendTransaction({
          to: bridge.outgoing_address,
          value: outgoing_amount
      });
      await eth_payment.wait();
    } catch (e) {
      console.error("Trade failed");
      console.error(e);
      continue;
    }
    const outgoing_txid = eth_payment.hash;

    const readable_outgoing_amount = outgoing_amount.toString() / 1e18;
    const update_outgoing_txid = await db.query(
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW() WHERE deposit_txid = $3", 
      [outgoing_txid, readable_outgoing_amount, bridge.deposit_txid]
    );

    console.log(`Trade Executed: ${bridge.deposit_amount} BTC for ${readable_outgoing_amount} ETH. Price ${eth_btc_price}. TXID: ${outgoing_txid}`);
  }

  setTimeout(makePayments, 5000);
}
