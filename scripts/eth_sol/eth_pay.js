import pg from 'pg'
import dotenv from 'dotenv'
import { ethers } from 'ethers'

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

const FEE_MULTIPLIER = 0.998

makePayments()

async function makePayments () {
  const {rows: unpaidBridges} = await db.query("SELECT * FROM bridges WHERE paid=false AND outgoing_currency = 'ETH' AND outgoing_address IS NOT NULL AND deposit_currency='SOL'");

  let ethSolPrice;
  try {
    ethSolPrice = await getEthSolPrice()
  } catch (e) {
    console.error("Error fetching ETH-SOL price");
    console.error(e);
    setTimeout(makePayments, 5000);
    return;
  }

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

  for (let bridge of unpaidBridges) {

    let makerBalance;
    try {
      makerBalance = await ethersProvider.getBalance(ethWallet.address);
    } catch (e) {
      console.error("Error getting maker balance")
      console.error(e);
      break;
    }

    const outgoing_amount = ethers.BigNumber.from((bridge.deposit_amount * FEE_MULTIPLIER * ethSolPrice * 1e18).toFixed(0)).sub(network_fee)
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
    await db.query(
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW() WHERE deposit_txid = $3", 
      [outgoing_txid, readable_outgoing_amount, bridge.deposit_txid]
    );

    console.log(`Trade Executed: ${bridge.deposit_amount} SOL for ${readable_outgoing_amount} ETH. Price ${ethSolPrice}. TXID: ${outgoing_txid}`);
  }

  setTimeout(makePayments, 5000);
}

function getEthSolPrice () {
  return fetch('https://api.coincap.io/v2/assets', {
    headers: {
      'Authorization': `Bearer ${process.env.COIN_CAP_API_KEY}`
    }
  }).then(res => res.json()).then(({data}) => {
    const etheremPrice = data.find(asset => asset.id === 'ethereum').priceUsd
    const solanaPrice = data.find((asset) => asset.id === 'solana').priceUsd
    return Number(solanaPrice) / Number(etheremPrice)
  })
}
