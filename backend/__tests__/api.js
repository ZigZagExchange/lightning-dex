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

  test("Duplicate invoice throws error", async () => {
    const invoice = new LNInvoice.Invoice();
    invoice.network = "bc";
    invoice.valueSat = 25000000;
    invoice.timestamp = parseInt(Date.now() / 1000);
    invoice.paymentHash = hash;
    invoice.shortDesc = "eth:WBTC:0.25";
    invoice.expiry = 3600;
    const encodedInvoice = LNInvoice.encode(invoice, privKey);
    const response = await request(app).post("/invoice").send({ invoice: encodedInvoice });
    expect(response.statusCode).toBe(500);
  });

  test("Bad expiry", async () => {
    const invoice = new LNInvoice.Invoice();
    invoice.network = "bc";
    invoice.valueSat = 25000000;
    invoice.timestamp = parseInt(Date.now() / 1000);
    invoice.paymentHash = hash;
    invoice.shortDesc = "eth:WBTC:0.25";
    invoice.expiry = 10;
    const encodedInvoice = LNInvoice.encode(invoice, privKey);
    const response = await request(app).post("/invoice").send({ invoice: encodedInvoice });
    expect(response.statusCode).toBe(500);
    expect(response.body.err).toBe("Bad expiry. Expires in less than 10 min");
  });

  test("Get an invoice by hash", async () => {
    const response = await request(app).get("/hash/" + hash);
    expect(response.statusCode).toBe(200);
    expect(response.body.hash).toBe(hash);
    expect(response.body.invoice).toBeTruthy();
  });

  test("publish channels", async () => {
    const channels = [
      {
        "remote_pubkey": "0378b189d84fc901a448376d7142a41881a89386e6cb766b4c6c7f76468f0f2d06",
        "local_balance": "10000",
        "remote_balance": "9988777"
      }
    ]
    const response = await request(app).post("/channels").send(channels);
    expect(response.statusCode).toBe(200);
  });

  test("get channels", async () => {
    const channels = [
      {
        "remote_pubkey": "0378b189d84fc901a448376d7142a41881a89386e6cb766b4c6c7f76468f0f2d06",
        "local_balance": "10000",
        "remote_balance": "9988777"
      }
    ]
    const response = await request(app).post("/channels").send(channels);
    expect(response.statusCode).toBe(200);

    const channels_response = await request(app).get("/channels");
    expect(channels_response.statusCode).toBe(200);
    expect(channels_response.body instanceof Array).toBe(true);
    expect(channels_response.body.length).toBe(1);
    expect(channels_response.body[0].remote_pubkey).toBe(channels[0].remote_pubkey);
    expect(channels_response.body[0].local_balance).toBe(channels[0].local_balance);
    expect(channels_response.body[0].remote_balance).toBe(channels[0].remote_balance);
  });
});

afterAll(async () => {
  await db.end()
});

