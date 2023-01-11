import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import React, { useState } from 'react'
import { invoiceDecode } from '../helpers/decoder'
import { connectWallet } from '../helpers/wallet'
import { ethers } from 'ethers'
import { GOERLI_WBTC_ADDRESS, GOERLI_BRIDGE_ADDRESS } from '../helpers/constants'

const ERC20_ABI = require('../helpers/ERC20.abi.json');
const BRIDGE_ABI = require('../helpers/BTCBridge.abi.json');

export default function Home() {
  
  const [userInvoice, setUserInvoice] = useState(null);
  const [lockWbtcError, setLockWbtcError] = useState("");
  const [wbtcLocked, setWbtcLocked] = useState(false);
  let decodedInvoice;
  try {
    decodedInvoice = invoiceDecode(userInvoice);
  } catch (e) {
    decodedInvoice = {
      human_readable_part: {
        amount: 0,
      },
      data: {
        tags: []
      }
    }
  }

  function handleTextAreaChange(e) {
    setUserInvoice(e.target.value);
  }

  async function lockWBTC() {
    const amount = ethers.BigNumber.from(decodedInvoice.human_readable_part.amount).mul(1003).div(1000); // 0.3% fee
    const payment_hash = decodedInvoice.data.tags.find(t => t.description === "payment_hash")?.value;
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
      if (depositResponse.status === 0) return setWbtcLocked(true);
    } catch (e) {
      return setLockWbtcError(e.message);
    }

  }

  async function submitInvoice() {
  }

  function satsToBitcoin(sats) {
    return sats / 1e8;
  }

  const payment_hash = decodedInvoice.data.tags.find(t => t.description === "payment_hash")?.value;
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
          <div>Amount: {decodedInvoice.human_readable_part.amount} sats ({satsToBitcoin(decodedInvoice.human_readable_part.amount)} BTC)</div>
          <div>Payment Hash: {payment_hash}</div>
        </div>

        <h2>Step 2: Lock WBTC</h2>
        <p>Submitting this transaction will hashlock WBTC into an atomic swap smart contract. Your trading partner will not be able to unlock the WBTC until they pay your Lightning invoice.</p>
        <button onClick={lockWBTC} disabled={!payment_hash}>Lock WBTC</button>
        <p>{lockWbtcError}</p>

        <h2>Step 3: Submit Invoice</h2>
        <p>Once your lock transaction confirms, submit your invoice. Your trading partner will check if your WBTC has been locked up properly, and pay your Lightning invoice if it has.</p>
        <button onClick={submitInvoice} disabled={!wbtcLocked}>Submit Invoice</button>

        <h2>Step 4: Check Your Lightning Wallet</h2>
        <p>Your invoice should be paid within 2-3 minutes. If it doesn't get paid, you can reclaim your WBTC in 2 hours. The process is trustless, so you can never lose your funds.</p>  

        <h2>Troubleshooting</h2>
        <p><i>Question: I locked my WBTC into the contract, but accidentally closed/refreshed the page before I could submit the invoice. Can I continue where I left off?</i></p>
        <p>Yes. Paste the same invoice back into Step 1, then hit Lock WBTC in Step 2. Instead of submitting a new tx, the site will detect that you have already funded that hash and skip to the next step.</p>

      </main>
    </>
  )
}
