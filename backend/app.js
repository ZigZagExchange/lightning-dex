const express = require('express')
const app = express()
const LNInvoice = require("@node-lightning/invoice");
const { Pool } = require('pg');
const crypto = require('crypto');
const nodeChildProcess = require('node:child_process');
const util = require('node:util');

const exec = util.promisify(nodeChildProcess.exec);

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function runDbMigration () {
  await db.query(`
    CREATE TABLE IF NOT EXISTS hashes (
      hash TEXT PRIMARY KEY,
      invoice TEXT
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS invoice_requests (
      id SERIAL PRIMARY KEY,
      amount NUMERIC
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS deposit_addresses (
      deposit_currency TEXT,
      deposit_address TEXT,
      outgoing_currency TEXT,
      outgoing_address TEXT
    )
  `);
  await db.query(`
      CREATE UNIQUE INDEX unique_deposit_address ON deposit_addresses(deposit_currency, outgoing_currency, outgoing_address);
  `);
}

runDbMigration();

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

//app.post('/invoice', async (req, res, next) => {
//  const invoice = req.body.invoice;
//  let decodedInvoice;
//  try {
//    decodedInvoice = LNInvoice.decode(invoice);
//  } catch (e) {
//    return next("Bad invoice: " + e.message);
//  }
//  const now = Math.floor(Date.now() / 1000)
//  const unix_expiry = decodedInvoice.timestamp + decodedInvoice.expiry;
//  if (unix_expiry < now + 600) {
//    return next("Bad expiry. Expires in less than 10 min");
//  }
//  const hash = decodedInvoice.paymentHash.toString('hex');
//  try {
//    await db.query("INSERT INTO hashes VALUES ($1, $2)", [hash, invoice]);
//  }
//  catch (e) {
//    return next(e.detail);
//  }
//  res.status(200).json({"success": true });
//})
//
//app.get('/hash/:hash', async (req, res, next) => {
//  const hashes = await db.query("SELECT * FROM hashes WHERE hash=$1", [req.params.hash]);
//  if (hashes.rows.length > 0) res.status(200).json(hashes.rows[0]);
//  else next("Hash not found");
//})
//
//app.get('/invoice/request/:amount', async (req, res, next) => {
//  const amount = parseInt(req.params.amount);
//  if (isNaN(amount)) return next("Invalid amount");
//  if (amount < 2000) return next("Min amount is 2000");
//  const invoicegen = await exec(`lncli addinvoice --amt ${amount}`);
//  const invoice = JSON.parse(invoicegen.stdout)
//
//  res.status(200).json(invoice);
//});

app.get('/deposit_address', async (req, res, next) => {
  const deposit_currency = req.query.currency_in;
  const outgoing_currency = req.query.currency_out;
  const outgoing_address = req.query.address_out;

  const valid_deposit_currencies = ["BTC"];
  const valid_outgoing_currencies = ["ETH"];
  if (!valid_deposit_currencies.includes(deposit_currency)) return next("Bad deposit currency"):
  if (!valid_outgoing_currencies.includes(outgoing_currency)) return next("Bad outgoing currency"):

  const deposit_address = await db.query("SELECT * FROM deposit_addresses WHERE deposit_currency=$1 AND outgoing_currency=$2 AND outgoing_address=$3 LIMIT 1", [deposit_currency, outgoing_currency, outgoing_address]);

  if (deposit_address.rows.length > 0) return res.status(200).json(deposit_address.rows[0]);
  else {
    const addressgen = await exec(`bitcoin-cli getnewaddress`);
    const deposit_address = addressgen.stdout;
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

module.exports = { app, db, runDbMigration }
