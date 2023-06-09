# Zap

Zap is a cross-chain crypto swap protocol. It specializes in supporting native tokens with no counterparty risk such as ETH, BTC, and SOL. 

This document provides an overview of how to interact with the protocol. 

## Base URLs

* Mainnet: https://api.zap.zigzag.exchange
* Testnet: https://api.zap.zigzag.exchange/testnet

## Currencies

The following currencies are supported by the API: 

* BTC: Bitcoin
* ETH: Ethereum
* SOL: Solana

## Swaps

The following swaps are supported by the API: 

* ETH-SOL
* ETH-BTC

## Testnets

We use the Goerli Testnet for ETH, Solana Devnet for SOL, and Bitcoin Testnet for BTC. 

Your funds can be irrevecably lost if you use the mainnet improperly. Please verify your code on testnet before implementing it on mainnet.  

## Smart Contracts

Swapping from ETH to SOL or BTC is done via a smart contract. The verified code and ABI for each contract is available on Etherscan. 

To send ETH, call the `depositETH` function on the appropriate contract with the requested ETH `value`, `out_chain`, and `out_address`. The `out_chain` must be `SOL` on the ETH-SOL contract and `BTC` on the ETH-BTC contract. 

* ETH-BTC (mainnet): [0x64Ca3FCa3B43c98F12A9E9509f9cF8AB18abc208](https://etherscan.io/address/0x64Ca3FCa3B43c98F12A9E9509f9cF8AB18abc208) 
* ETH-SOL (mainnet): Coming Soon

The contracts are avaiable on Goerli Testnet for testing as well. 

* ETH-BTC (testnet): [0xC7F355DE8cC7ec65d275f6Bc3349787c9FB48ACD](https://goerli.etherscan.io/address/0xC7F355DE8cC7ec65d275f6Bc3349787c9FB48ACD)
* ETH-SOL (testnet): [0x43b2FF69196a1b9641C1fCBaB6A869B4e256Fb12](https://goerli.etherscan.io/address/0x43b2FF69196a1b9641C1fCBaB6A869B4e256Fb12)

## Deposit Addresses

Swapping from BTC or SOL to ETH is supported via deposit addresses. Please see the endpoints for more detail. 

## Endpoints

### GET /btc_deposit

Generate a deposit address to swap BTC for ETH. Every outgoing address will have a unique deposit address. Make sure you double check the address you enter. If you enter the wrong `outgoing_address` your ETH will be lost forever and we will not refund you. 

All BTC sent to the 

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

Generate a deposit address to swap SOL for ETH. SOL deposit addresses are one time use and expire at the specified time. Duplicate deposits or deposits sent after the expiry will not be processed. 

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
