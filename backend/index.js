const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const LNInvoice = require("@node-lightning/invoice");
const { Pool } = require('pg');
const crypto = require('crypto');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

db.query(`
  CREATE TABLE IF NOT EXISTS hashes (
    hash TEXT PRIMARY KEY,
    invoice TEXT,
    preimage TEXT
  )
`);

app.use(express.json());

app.post('/invoice', async (req, res) => {
  const invoice = req.body.invoice;
  let decodedInvoice;
  try {
    decodedInvoice = LNInvoice.decode(invoice);
  } catch (e) {
    return next("Bad invoice: " + e.message);
  }
  const now = parseInt(Date.now() / 1000)
  if ((decodedInvoice.timestamp + decodedInvoice.expiry) < now + 600) {
    return next("Bad expiry. Expiry should be 1 hour");
  }
  await db.query("INSERT INTO hashes (hash, invoice) VALUES ($1, $2)", [payment_hash, invoice]);
  res.status(200).json({"success": true });
})

app.get('/hash/:hash', async (req, res) => {
  const hashes = await db.query("SELECT * FROM hashes WHERE hash=$1", [payment_hash]);
  if (hashes.rows.length > 0) res.status(200).json(hashes.rows[0]);
  else next("Hash not found");
})

app.post('/hash/preimage', async (req, res) => {
  const preimage = req.body.preimage;
  const hash = req.body.hash;
  const computedHash = crypto.createHash('sha256').update(preimage, 'hex').digest('hex');
  if (hash !== computedHash) return next("preimage does not match hash");
  await db.query("INSERT INTO hashes(hash, preimage) VALUES ($1,$2) ON CONFLICT DO UPDATE preimage=$2", [hash, preimage]);
  res.status(200).json({"success": true });
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ "err": err.message })
})


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
