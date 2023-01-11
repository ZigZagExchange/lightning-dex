const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { invoiceDecode } = require('./decoder');

app.use(express.json());

app.post('/invoice', (req, res) => {
  const invoice = req.body.invoice;
  let decodedInvoice;
  try {
    decodedInvoice = invoiceDecode(invoice);
  } catch (e) {
    return next("Bad invoice: " + e.message);
  }
  const expiry = decodedInvoice.data.tags.find(t => t.description === "expiry");
  const timestamp = decodedInvoice.data.time_stamp;
  const now = parseInt(Date.now() / 1000)
  if (!expiry || expiry
})

app.get('/hash/:hash', (req, res) => {
  res.send('Hello World!')
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
