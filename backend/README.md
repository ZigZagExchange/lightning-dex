# Zap API

This document provides an overview of the backend API endpoints and their usage.

## Base URLs

* Mainnet: https://api.zap.zigzag.exchange
* Testnet: https://api.zap.zigzag.exchange/testnet

## Currencies

The following currencies are supported by the API: 

* BTC: Bitcoin
* ETH: Ethereum
* SOL: Solana


## Endpoints

### GET /btc_deposit

Generate a deposit address to swap BTC for ETH.

Example Request:

https://api.zap.zigzag.exchange/btc_deposit?outgoing_currency=ETH&outgoing_address=0xE4ADed7c6515c73B83f6aC4C01930c8A40A1c43E

Response:

```
{
  "deposit_currency":"BTC",
  "deposit_address":"tb1qjylf9cscuj89gucm7tkackx4qsxh7ungsmzuxq",
  "outgoing_currency":"ETH",
  "outgoing_address":"0xE4ADed7c6515c73B83f6aC4C01930c8A40A1c43E"
}
```

### GET /sol_deposit

Generate a deposit address to swap SOL for ETH

Example Request:

https://api.zap.zigzag.exchange/sol_deposit?outgoing_currency=ETH&outgoing_address=0xE4ADed7c6515c73B83f6aC4C01930c8A40A1c43E

Response:

```
{
  "deposit_address":"F5E9kwLLPQ2P4RAeQLGGSrDrbVuaSsaXHcXSDCHiWFn8",
  "expires_at":1686263061
}
```



### GET /history/:address

Get an account's bridging history. 

Example Request:

https://api.zap.zigzag.exchange/history/0xE4ADed7c6515c73B83f6aC4C01930c8A40A1c43E

Response:

```
[  
  {
    "deposit_currency": "BTC",
    "deposit_address": "bc1qdknckpa5h5kl2wedhsjw6n85ddkytf9dmfrz2u",
    "deposit_amount": "0.01",
    "deposit_txid": "0cd7c085eda7431c6d634afed0c681cb2bf2fa998ac9a2b3137172e37ed272d8",
    "deposit_timestamp": "2023-06-01T19:40:33.786Z",
    "outgoing_currency": "ETH",
    "outgoing_address": "0xE4ADed7c6515c73B83f6aC4C01930c8A40A1c43E",
    "outgoing_amount": "0.1405146142799961",
    "outgoing_txid": "0x670b46ec75934ea2bfb3d98d3ea1b0038ded6447604a2dd891517ad83e3f865a",
    "outgoing_timestamp": "2023-06-01T19:40:49.590Z",
    "paid": true
  }
]
```
### GET /prices

Example Request:

https://api.zap.zigzag.exchange/prices

Response
```
{
    "btc_usd": 26690.19,
    "eth_usd": 1853.5622852385998,
    "sol_usd": 18.873888749272282
}
```
