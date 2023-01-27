import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import React, { useState } from 'react'
import { connectWallet } from '../helpers/wallet'
import { satsToBitcoin, bitcoinToSats } from '../helpers/utils'
import { ethers } from 'ethers'
import { OPEN_CHANNEL_FEE, NETWORK_FEE, CHAIN_CONFIG } from '../helpers/constants'
import Link from 'next/link'
let LNInvoice = require("@node-lightning/invoice");


const ERC20_ABI = require('../helpers/ERC20.abi.json');
const BRIDGE_ABI = require('../helpers/BTCBridge.abi.json');

export default function Home() {
  
  const [userInvoice, setUserInvoice] = useState(null);
  const [lockWbtcError, setLockWbtcError] = useState("");

  function handleTextAreaChange(e: any) {
    setUserInvoice(e.target?.value);
  }

  function getDecodedInvoice () {
    try {
      return LNInvoice.decode(userInvoice);
    } catch (e) {
      return {
        valueSat: 0,
        timestamp: Math.floor(Date.now() / 1000),
        expiry: 0,
        paymentHash: Buffer.alloc(0)
      }
    }
  }

  async function lockWBTC() {
    const decodedInvoice = getDecodedInvoice();
    const wbtc_amount = ethers.BigNumber.from(Math.floor(decodedInvoice.valueSat) + NETWORK_FEE);
    const payment_hash = decodedInvoice.paymentHash.toString('hex');
    if (payment_hash.length < 32) {
      return setLockWbtcError('Payment hash is invalid');
    }

    const wallets = await connectWallet();
    const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, Number(wallets[0].chains[0].id))
    const address = wallets[0].accounts[0].address;
    const WBTC = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcAddress, ERC20_ABI, ethersProvider);
    const WBTCSigner = WBTC.connect(ethersProvider.getSigner());


    const allowance = await WBTC.allowance(address, CHAIN_CONFIG.arbitrum.wbtcVaultAddress);
    const balance = await WBTC.balanceOf(address);
    if (wbtc_amount.gt(balance)) {
      const max_send = balance.sub(NETWORK_FEE);
      return setLockWbtcError(`Amount + Fee exceeds balance. Max invoice amount should be ${max_send} sats`);
    }
    if (wbtc_amount.gt(allowance)) {
      const approveTx = await WBTCSigner.approve(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, ethers.constants.MaxUint256);
    }

    const expiry = Math.floor(Date.now() / 1000) + 7200;
    const Bridge = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, BRIDGE_ABI);
    const BridgeSigner = Bridge.connect(ethersProvider.getSigner());
    const hashStatus = await BridgeSigner.DEPOSIT_HASHES('0x' + payment_hash);
    if (hashStatus.wbtc_amount.gt(0)) {
      return setLockWbtcError("Hash is already funded");
    }
    try {
      const depositTx = await BridgeSigner.createDepositHash(wbtc_amount.toString(), '0x' + payment_hash, expiry);
      const depositResponse = await depositTx.wait();
      await submitInvoice();
      // TODO: Update My Swaps
    } catch (e: any) {
      return setLockWbtcError(e.message);
    }

  }

  async function submitInvoice() {
    const response = await fetch('https://api.bitcoin.zigzag.exchange/invoice', {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        invoice: userInvoice
      })
    });
    const json = await response.json();
    if (response.status != 200) {
      return setLockWbtcError(json.err);
    }
  }

  function getInvoiceExpirySeconds () {
    const decodedInvoice = getDecodedInvoice();
    return decodedInvoice.timestamp + decodedInvoice.expiry - Math.floor(Date.now() / 1000);
  }

  const decodedInvoice = getDecodedInvoice();
  return (
    <>
      <Head>
        <title>Lightning DEX</title>
        <meta name="description" content="The Lightning to Ethereum Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <nav>
          <Link href="/">Swap</Link>&nbsp;
          <Link href="/pool">Pool</Link>
        </nav>

        <h1>Swap</h1>

        <h2>Open a Channel</h2>
        <p className={styles.connection}>02572fcd9ca25472108ff62b975dff47f5625e57abcf0f354065c9586db8dbd632@34.214.120.115:9735</p>

        <h2>My Swaps</h2>
        <p><button onClick={connectWallet}>Load History</button></p>

        <h2>New Swap</h2>
        <textarea placeholder="Paste lightning invoice here..." rows={5} onChange={handleTextAreaChange}></textarea>
        <div>Receive: {satsToBitcoin(decodedInvoice.valueSat)} BTC</div>
        <div>Send: {satsToBitcoin(Number(decodedInvoice.valueSat) + NETWORK_FEE)} WBTC</div>
        <div>Payment Hash: {decodedInvoice.paymentHash.toString('hex')}</div>
        <p><button onClick={lockWBTC}>Lock WBTC</button></p>
        <p className={styles.errormessage}>{lockWbtcError}</p>

        <h2 className={styles.troubleshooting}>Troubleshooting</h2>
        <p><i>Question: I locked my WBTC into the contract, but it is not showing up in my swaps.</i></p>
        <p>Paste the same invoice back into New Swap and click Lock WBTC. Instead of submitting a new tx, the site will detect that you have already funded that hash.</p>

      </main>
    </>
  )
}
