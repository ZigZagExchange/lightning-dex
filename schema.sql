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

CREATE TABLE IF NOT EXISTS sol_deposits (
  id TEXT,
  deposit_address TEXT,
  outgoing_currency TEXT,
  outgoing_address TEXT,
  completed BOOLEAN DEFAULT FALSE,
  expiry TIMESTAMP
);

ALTER TABLE bridges ADD COLUMN fee NUMERIC;

CREATE TABLE IF NOT EXISTS lp_deposits (
  deposit_address TEXT NOT NULL,
  deposit_currency TEXT NOT NULL,
  outgoing_address TEXT NOT NULL,
  deposit_timestamp TIMESTAMP,
  deposit_amount NUMERIC,
  deposit_txid TEXT,
  lp_token_mint_txid TEXT
);

CREATE TABLE IF NOT EXISTS lp_payouts (
  burn_txid TEXT NOT NULL PRIMARY KEY,
  currency TEXT NOT NULL,
  outgoing_txid TEXT
);
