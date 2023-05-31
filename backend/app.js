const express = require('express')
const app = express()
const LNInvoice = require("@node-lightning/invoice");
const { Pool } = require('pg');
const crypto = require('crypto');
const nodeChildProcess = require('node:child_process');
const util = require('node:util');
const dotenv = require('dotenv');
const { ethers } = require('ethers');

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

app.get('/deposit_address', async (req, res, next) => {
  const deposit_currency = req.query.deposit_currency;
  const outgoing_currency = req.query.outgoing_currency;
  const outgoing_address = req.query.outgoing_address;

  const valid_deposit_currencies = ["BTC"];
  const valid_outgoing_currencies = ["ETH"];
  if (!valid_deposit_currencies.includes(deposit_currency)) return next("Bad deposit_currency")
  if (!valid_outgoing_currencies.includes(outgoing_currency)) return next("Bad outgoing_currency")
  if (!outgoing_address) return next("Must set outgoing_address")
  if (!ethers.isAddress(outgoing_address)) return next("Invalid outgoing_address")

  const deposit_address = await db.query("SELECT * FROM deposit_addresses WHERE deposit_currency=$1 AND outgoing_currency=$2 AND outgoing_address=$3 LIMIT 1", [deposit_currency, outgoing_currency, outgoing_address]);

  if (deposit_address.rows.length > 0) return res.status(200).json(deposit_address.rows[0]);
  else {
    const addressgen = await exec(`${process.env.BITCOIN_CLI_PREFIX} getnewaddress`);
    const deposit_address = addressgen.stdout.trim();
    try {
      await db.query("INSERT INTO deposit_addresses (deposit_currency, deposit_address, outgoing_currency, outgoing_address) VALUES ($1,$2,$3,$4)", [deposit_currency, deposit_address, outgoing_currency, outgoing_address]);
    } catch (e) {
      return next(e);
    }
    return res.status(200).json({ deposit_currency, deposit_address, outgoing_currency, outgoing_address });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ err })
})

module.exports = { app, db }
