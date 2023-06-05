const express = require('express')
const app = express()
const LNInvoice = require("@node-lightning/invoice");
const { Pool } = require('pg');
const crypto = require('crypto');
const nodeChildProcess = require('node:child_process');
const util = require('node:util');
const dotenv = require('dotenv');
const { ethers } = require('ethers');
const bs58 = require('bs58')
const { Keypair } = require('@solana/web3.js')
const { v4: uuid } = require('uuid')

dotenv.config();

const exec = util.promisify(nodeChildProcess.exec);

const db = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zap',
  user: 'postgres',
  password: 'postgres'
});

// CORS
app.use('/', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  next()
})

app.use(express.json());

async function getBitcoinDepositAddress () {
  const addressgen = await exec(`${process.env.BITCOIN_CLI_PREFIX} getnewaddress`);
  return addressgen.stdout.trim();
}

function getSolanaDepositAddress (depositId) {
  const masterPrivateKey = Buffer.from(process.env.SOL_LIQUIDITY_ACCOUNT_PRIV_KEY_BASE58, 'utf-8')
  const seed = crypto.createHash('sha256').update(masterPrivateKey).update(depositId).digest()
  return Keypair.fromSeed(seed).publicKey.toString()
}

app.get('/deposit_address', async (req, res, next) => {
  const deposit_currency = req.query.deposit_currency;
  const outgoing_currency = req.query.outgoing_currency;
  const outgoing_address = req.query.outgoing_address;

  const valid_deposit_currencies = ["BTC", 'SOL'];
  const valid_outgoing_currencies = ["ETH"];
  if (!valid_deposit_currencies.includes(deposit_currency)) return next("Bad deposit_currency")
  if (!valid_outgoing_currencies.includes(outgoing_currency)) return next("Bad outgoing_currency")
  if (!outgoing_address) return next("Must set outgoing_address")
  if (!ethers.isAddress(outgoing_address)) return next("Invalid outgoing_address")

  const depositAddressId = uuid()

  const deposit_address = await db.query("SELECT * FROM deposit_addresses WHERE deposit_currency=$1 AND outgoing_currency=$2 AND outgoing_address=$3 LIMIT 1", [deposit_currency, outgoing_currency, outgoing_address]);

  if (deposit_address.rows.length > 0) return res.status(200).json(deposit_address.rows[0]);
  else {
    let deposit_address
    if (deposit_currency === 'BTC') {
      deposit_address = await getBitcoinDepositAddress()
    } else if (deposit_currency === 'SOL') {
      deposit_address = getSolanaDepositAddress(depositAddressId)
    } else {
      return next('Unexecpeted error')
    }

    try {
      await db.query("INSERT INTO deposit_addresses (deposit_currency, deposit_address, outgoing_currency, outgoing_address, id) VALUES ($1,$2,$3,$4,$5)", [deposit_currency, deposit_address, outgoing_currency, outgoing_address, depositAddressId]);
    } catch (e) {
      return next(e);
    }
    return res.status(200).json({ deposit_currency, deposit_address, outgoing_currency, outgoing_address });
  }
});

app.get("/history/:address", async (req, res, next) => {
    if (!req.params.address) return next("GET /history/:address. Missing address");
    try {
      const bridges = await db.query("SELECT * FROM bridges WHERE LOWER(deposit_address)=$1 OR LOWER(outgoing_address)=$1", [req.params.address.toLowerCase()]);
      return res.status(200).json(bridges.rows);
    } catch (e) {
      return next(e);
    }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ err })
})

module.exports = { app, db }
