CREATE TABLE IF NOT EXISTS deposit_addresses (
  deposit_currency TEXT,
  deposit_address TEXT,
  outgoing_currency TEXT,
  outgoing_address TEXT
);
CREATE UNIQUE INDEX unique_deposit_address ON deposit_addresses(deposit_currency, outgoing_currency, outgoing_address);

CREATE TABLE IF NOT EXISTS bridges(
    deposit_currency TEXT NOT NULL,
    deposit_address TEXT NOT NULL,
    deposit_amount NUMERIC NOT NULL,
    deposit_txid TEXT UNIQUE NOT NULL,
    deposit_timestamp TIMESTAMP NOT NULL,
    outgoing_currency TEXT,
    outgoing_address TEXT,
    outgoing_amount NUMERIC,
    outgoing_txid TEXT UNIQUE,
    outgoing_timestamp TIMESTAMP,
    paid BOOLEAN DEFAULT FALSE
);
