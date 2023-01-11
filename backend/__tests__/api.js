const request = require("supertest");
const { app, db, runDbMigration } = require("../app.js")
const LNInvoice = require("@node-lightning/invoice");
const crypto = require('crypto');

const privKey = Buffer.from(
    "e126f68f7eafcc8b74f54d269fe206be715000f94dac067d1c04a8ca3b2db734",
    "hex",
);
const preimage = "9915a4c377ccdad9c29d2709a95f3223";
const hash = crypto.createHash("sha256").update(preimage, "hex").digest("hex");

beforeAll(async () => {
  await db.query("DROP TABLE IF EXISTS hashes");
  await runDbMigration();
});

describe("Tests", () => {
  test("Submit an invoice", async () => {
    const invoice = new LNInvoice.Invoice();
    invoice.network = "bc";
    invoice.valueSat = 25000000;
    invoice.timestamp = parseInt(Date.now() / 1000);
    invoice.paymentHash = hash;
    invoice.shortDesc = "eth:WBTC:0.25";
    invoice.expiry = 3600;
    const encodedInvoice = LNInvoice.encode(invoice, privKey);
    const response = await request(app).post("/invoice").send({ invoice: encodedInvoice });
    expect(response.statusCode).toBe(200);
  });

  test("Get a list of invoices", async () => {
    const response = await request(app).get("/invoices");
    expect(response.statusCode).toBe(200);
    expect(response.body instanceof Array).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].hash).toBe(hash);
  });

  test("Submit a preimage for an invoice", async () => {
    const response = await request(app).post("/hash/preimage").send({ hash, preimage });
    expect(response.statusCode).toBe(200);
  });

  test("Invoice info should include the preimage", async () => {
    const response = await request(app).get("/invoices");
    expect(response.body[0].preimage).toBe(preimage);
  });

  test("Submit a preimage without an invoice", async () => {
    const preimage = "362f4499fd0466e03b603e43127b1d66";
    const hash = crypto.createHash("sha256").update(preimage, "hex").digest("hex");
    const response = await request(app).post("/hash/preimage").send({ hash, preimage });
    expect(response.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await db.end()
});

