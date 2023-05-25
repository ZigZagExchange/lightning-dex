import { ethers } from 'ethers'
import dotenv from 'dotenv'
import fs from 'fs'
import pg from 'pg'
import fetch from 'node-fetch'
import nodeChildProcess from 'node:child_process'
import util from 'node:util'

dotenv.config()

const exec = util.promisify(nodeChildProcess.exec);

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'zap',
  user: 'postgres',
  password: 'postgres'
});

makePayments();
setInterval(makePayments, 5000);

const gmx_tokens = {
  "BTC": "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  "ETH": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
}

async function makePayments() {
  const result = await db.query("SELECT * FROM bridges WHERE paid=false AND outgoing_currency = 'BTC' AND outgoing_address IS NOT NULL AND deposit_currency='ETH'");
  const prices = await fetch("https://api.gmx.io/prices").then(response => response.json());

  for (let bridge of result.rows) {
    const btc_price = prices[gmx_tokens.BTC] / 1e30;
    const eth_price = prices[gmx_tokens.ETH] / 1e30;
    const eth_btc_price = eth_price / btc_price;
    if (typeof eth_btc_price !== "number" || isNaN(eth_btc_price)) throw new Error("ethbtc price is invalid");
    if (eth_btc_price > 0.1 || eth_btc_price < 0.04) throw new Error("ethbtc price failed sanity check");

    const balanceCheck = await exec(`bitcoin-core.cli -testnet getwalletinfo`);
    const walletInfo = JSON.parse(balanceCheck.stdout);
    const outgoing_amount = Number((bridge.deposit_amount * eth_btc_price).toFixed(8));
    if (walletInfo.balance < outgoing_amount) continue;

    const update_paid = await db.query("UPDATE bridges SET paid=true WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (update_paid.rowCount !== 1) throw new Error("Weird failure in paid update");

    const btc_payment = await exec(`bitcoin-core.cli -testnet sendtoaddress ${bridge.outgoing_address} ${outgoing_amount}`);
    const outgoing_txid = btc_payment.stdout.trim();

    const update_outgoing_txid = await db.query(
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW() WHERE deposit_txid = $3", 
      [outgoing_txid, outgoing_amount, bridge.deposit_txid]
    );
  }
}
