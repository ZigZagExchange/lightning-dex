import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import React, { useState } from 'react'
import { connectWallet } from '../helpers/wallet'
import { ethers } from 'ethers'
import { GOERLI_WBTC_ADDRESS, GOERLI_BRIDGE_ADDRESS } from '../helpers/constants'
let LNInvoice = require("@node-lightning/invoice");


const ERC20_ABI = require('../helpers/ERC20.abi.json');
const BRIDGE_ABI = require('../helpers/BTCBridge.abi.json');

export default function Home() {
  
  const [userInvoice, setUserInvoice] = useState(null);
  const [lockWbtcError, setLockWbtcError] = useState("");
  const [submitInvoiceError, setSubmitInvoiceError] = useState("");
  const [wbtcLocked, setWbtcLocked] = useState(false);
  const [invoiceSubmitted, setInvoiceSubmitted] = useState(false);

  function handleTextAreaChange(e) {
    setUserInvoice(e.target.value);
  }

  function getDecodedInvoice () {
    try {
      return LNInvoice.decode(userInvoice);
    } catch (e) {
      return {
        valueSat: 0,
        timestamp: parseInt(Date.now() / 1000),
        expiry: 0,
        paymentHash: Buffer.alloc(0)
      }
    }
  }

  async function lockWBTC() {
    const decodedInvoice = getDecodedInvoice();
    const amount = ethers.BigNumber.from(decodedInvoice.valueSat).mul(1003).div(1000); // 0.3% fee
    const payment_hash = decodedInvoice.paymentHash.toString('hex');
    if (payment_hash.length < 32) {
      return setLockWbtcError('Payment hash is invalid');
    }

    const wallets = await connectWallet();
    const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, Number(wallets[0].chains[0].id))
    const address = wallets[0].accounts[0].address;
    const WBTC = new ethers.Contract(GOERLI_WBTC_ADDRESS, ERC20_ABI, ethersProvider);
    const WBTCSigner = WBTC.connect(ethersProvider.getSigner());


    const allowance = await WBTC.allowance(address, GOERLI_BRIDGE_ADDRESS);
    const balance = await WBTC.balanceOf(address);
    if (amount.gt(balance)) {
      const max_send = balance.mul(1000).div(1003);
      return setLockWbtcError(`Amount + Fee exceeds balance. Max invoice amount should be ${max_send} sats`);
    }
    if (amount.gt(allowance)) {
      const approveTx = await WBTCSigner.approve(GOERLI_BRIDGE_ADDRESS, ethers.constants.MaxUint256);
    }

    const expiry = parseInt(Date.now() / 1000) + 7200;
    const Bridge = new ethers.Contract(GOERLI_BRIDGE_ADDRESS, BRIDGE_ABI);
    const BridgeSigner = Bridge.connect(ethersProvider.getSigner());
    const hashStatus = await BridgeSigner.DEPOSIT_HASHES('0x' + payment_hash);
    if (hashStatus.wbtc_amount.gt(0)) {
      setWbtcLocked(true);
      return setLockWbtcError("Hash is already funded");
    }
    try {
      const depositTx = await BridgeSigner.createDepositHash(amount.toString(), '0x' + payment_hash, expiry);
      setLockWbtcError("Submitted: " + depositTx.hash);
      const depositResponse = await depositTx.wait();
      console.log(depositResponse);
      if (depositResponse.status === 1) return setWbtcLocked(true);
    } catch (e) {
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
      return setSubmitInvoiceError(json.err);
    }
    else {
      setInvoiceSubmitted(true);
      return setSubmitInvoiceError("Submitted");
    }
  }

  function satsToBitcoin(sats) {
    return sats / 1e8;
  }

  function getInvoiceExpirySeconds () {
    const decodedInvoice = getDecodedInvoice();
    return decodedInvoice.timestamp + decodedInvoice.expiry - parseInt(Date.now() / 1000);
  }

  const decodedInvoice = getDecodedInvoice();
  const payment_hash = decodedInvoice.paymentHash.toString('hex');
  return (
    <>
      <Head>
        <title>Lightning DEX</title>
        <meta name="description" content="The Lightning to Ethereum Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>WBTC to Lightning</h1>

        <h2>Step 1: Create Invoice</h2>
        <p>Generate a Lightning invoice for the amount you want to receive in your wallet and paste it here.</p>
        <textarea placeholder="lnbc..." rows="5" onChange={handleTextAreaChange}></textarea>
        <div>
          <div>Amount: {decodedInvoice.valueSat} sats ({satsToBitcoin(decodedInvoice.valueSat)} BTC)</div>
          <div>Payment Hash: {payment_hash}</div>
          <div>Expiry: {getInvoiceExpirySeconds()} seconds</div>
        </div>

        <h2>Step 2: Lock WBTC</h2>
        <p>Submitting this transaction will hashlock WBTC into an atomic swap smart contract. Your trading partner will not be able to unlock the WBTC until they pay your Lightning invoice.</p>
        <button onClick={lockWBTC} disabled={!payment_hash || wbtcLocked || getInvoiceExpirySeconds() < 600}>Lock WBTC</button>
        <p>{lockWbtcError}</p>

        <h2>Step 3: Submit Invoice</h2>
        <p>Once your lock transaction confirms, you can submit your invoice. Your trading partner will check if your WBTC has been locked up properly, and pay your Lightning invoice if it has.</p>
        <button onClick={submitInvoice} disabled={!wbtcLocked || invoiceSubmitted}>Submit Invoice</button>
        <p>{submitInvoiceError}</p>

        <h2>Step 4: Check Your Lightning Wallet</h2>
        <p>Your invoice should be paid within 2-3 minutes. If it doesn't get paid, you can reclaim your WBTC in 2 hours. The process is trustless, so you can never lose your funds.</p>  

        <h2>Troubleshooting</h2>
        <p><i>Question: I locked my WBTC into the contract, but accidentally closed/refreshed the page before I could submit the invoice. Can I continue where I left off?</i></p>
        <p>Yes. Paste the same invoice back into Step 1, then hit Lock WBTC in Step 2. Instead of submitting a new tx, the site will detect that you have already funded that hash and skip to the next step.</p>

      </main>
    </>
  )
}
