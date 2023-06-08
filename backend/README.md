# Backend API Documentation

This document provides an overview of the backend API endpoints and their usage.

## Endpoints

#### /btc_deposit
This endpoint allows users to deposit Bitcoin (BTC) onto the BTC <> ETH Bridge and it has sql inserts to add it to the database. To use this endpoint, make a POST request to /btc_deposit with the necessary parameters. See example...

Request:

curl -X GET -H "Content-Type: application/json" -d '{
  "deposit_currency": "YOUR_DEPOSIT_CURRENCY",
  "outgoing_currency": "YOUR_OUTGOING_CURRENCY",
  "outgoing_address": "YOUR_OUTGOING_ADDRESS"
}' "http://YOUR_DOMAIN/btc_deposit"

Response:

{
  "deposit_address": "GENERATED_DEPSOIT_ADDRESS",
  "outgoing_currency": "OUTGOING_CURRENCY",
  "outgoing_address": "OUTGOING_ADDRESS"
}


##### /sol_deposit
This endpoint allows users to deposit Solana (SOL) onto the SOL <> ETH Bridge and it has sql inserts to add it to the database. To use this endpoint, make a POST request to /sol_deposit with the necessary parameters. See example...

Request:

curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{
  "outgoing_currency": "YOUR_OUTGOING_CURRENCY",
  "outgoing_address": "YOUR_OUTGOING_ADDRESS"
}' "http://YOUR_DOMAIN/sol_deposit"

Response:

{
  "deposit_address": "GENERATED_DEPSOT_ADDRESS",
  "expiry": "DEPOSIT_EXPIRY_TIMESTAMP"
}


###### /history
This endpoint retrieves addresses birdging history for the /sol_deposit and /btc_deposit. See example...

Request:

{
curl -X GET "http://YOUR_DOMAIN/history/YOUR_ADDRESS"
}

Response:
[
  ...list of successfully bridges

### /prices
Request
```
curl -X GET "http://YOUR_DOMAIN/prices"
```
Response
```
{
    "btc_usd": 26690.19,
    "eth_usd": 1853.5622852385998,
    "sol_usd": 18.873888749272282
}
```
]
