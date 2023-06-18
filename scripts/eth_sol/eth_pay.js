import pg from 'pg'
import dotenv from 'dotenv'
import { ethers } from 'ethers'
import {reportError} from './errors.js'
import { fetchPrices, getOutAmountAndFee } from './utils.js'

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

makePayments()

async function makePayments () {
  const {rows: unpaidBridges} = await db.query("SELECT * FROM bridges WHERE paid=false AND outgoing_currency = 'ETH' AND outgoing_address IS NOT NULL AND deposit_currency='SOL'");
  if (unpaidBridges.length === 0) {
    setTimeout(makePayments, 5000);
    return;
  }

  let depositUsdPrice
  let outgoingUsdPrice;
  try {
    const {ethUsd, solUsd} = await fetchPrices()
    depositUsdPrice = solUsd
    outgoingUsdPrice = ethUsd
  } catch (error) {
    await reportError('error getting prices', error)
    return
  }

  let feeData; 
  try {
    feeData = await ethersProvider.getFeeData();
    if (!feeData.gasPrice) throw new Error(feeData)
  } catch (error) {
    setTimeout(makePayments, 5000);
    await reportError('Error getting ETH fee data', error)
    return;
  }
  const network_fee = feeData.gasPrice.mul(21000).mul(2);

  for (let bridge of unpaidBridges) {

    let readableOutgoingAmount;
    let readableBridgeFee;
    try {
      const {amountMinusFee, fee} = await getOutAmountAndFee('SOL', 'ETH', depositUsdPrice, outgoingUsdPrice, bridge.deposit_amount)
      readableOutgoingAmount = amountMinusFee
      readableBridgeFee = fee
    } catch (error) {
      await reportError('error calculating outgoing amounts', error)
    }

    let makerBalance;
    try {
      makerBalance = await ethersProvider.getBalance(ethWallet.address);
    } catch (error) {
      await reportError('Error getting maker balance', error)
      break;
    }

    const outgoing_amount = ethers.BigNumber.from((readableOutgoingAmount * 1e18).toFixed()).sub(network_fee)
    if (makerBalance.lt(outgoing_amount)) continue;

    const select_deposit = await db.query("SELECT paid FROM bridges WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (select_deposit.rows.length != 1 || select_deposit.rows[0].paid) throw new Error("Double payment? Race condition activated");

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
    } catch (error) {
      await reportError('Trade failed', error)
      continue;
    }
    const outgoing_txid = eth_payment.hash;

    await db.query(
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW(), fee=$3 WHERE deposit_txid = $4", 
      [outgoing_txid, readableOutgoingAmount, readableBridgeFee, bridge.deposit_txid]
    );

    console.log(`Trade Executed: ${bridge.deposit_amount} SOL for ${readableOutgoingAmount} ETH. Price ${depositUsdPrice / outgoingUsdPrice}. TXID: ${outgoing_txid}`);
  }

  setTimeout(makePayments, 5000);
}