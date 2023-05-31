import { ethers } from 'ethers'
import dotenv from 'dotenv'
import fs from 'fs'
import pg from 'pg'

dotenv.config()

const db = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'zap',
  user: 'postgres',
  password: 'postgres'
});

const bridgeAbi = JSON.parse(fs.readFileSync('BTCBridge.json', "utf-8")).abi;

const ethersProvider = new ethers.providers.InfuraProvider(
    process.env.ETH_NETWORK,
    process.env.INFURA_PROJECT_ID,
);

const Bridge = new ethers.Contract(process.env.ETH_DEPOSIT_CONTRACT, bridgeAbi, ethersProvider);

updateBridges();
setInterval(updateBridges, 5000);

async function updateBridges() {
  let deposits;
  try {
    deposits = await Bridge.queryFilter(Bridge.filters.Deposit(), -100, -2);
  } catch (e) {
    console.error("Error while getting ETH deposits");
    console.error(e);
    return;
  }

  for (let deposit of deposits) {
    let deposit_currency;
    if (deposit.args.token === ethers.constants.AddressZero) deposit_currency = "ETH";
    const deposit_amount = (deposit.args.amount.toString() / 1e18).toString();
    const bridge_data = [deposit_currency, deposit.args.initiator, deposit_amount, deposit.transactionHash, deposit.args.out_chain, deposit.args.out_address];
    const result = await db.query(
      `INSERT INTO bridges (deposit_currency, deposit_address, deposit_amount, deposit_txid, deposit_timestamp, outgoing_currency, outgoing_address) 
       VALUES ($1,$2,$3,$4,NOW(),$5,$6) 
       ON CONFLICT (deposit_txid) DO NOTHING`, 
       bridge_data
    );
    if (result.rowCount === 1) console.log(bridge_data);
  }

}
