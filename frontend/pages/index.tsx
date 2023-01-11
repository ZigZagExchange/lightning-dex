import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import React, { useState } from 'react'
import { invoiceDecode } from '../helpers/decoder'
import { MAINNET_RPC_URL, GOERLI_RPC_URL } from '../helpers/constants'
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from 'ethers'

export default function Home() {
  
  const [userInvoice, setUserInvoice] = useState(null);
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
    const payment_hash = decodedInvoice.data.tags.find(t => t.description === "payment_hash")?.value;

    const injected = injectedModule()

    const onboard = Onboard({
      wallets: [injected],
      chains: [
        //{
        //  id: '0x1',
        //  token: 'ETH',
        //  label: 'Ethereum Mainnet',
        //  rpcUrl: MAINNET_RPC_URL
        //},
        {
          id: '0x5',
          token: 'ETH',
          label: 'Goerli Testnet',
          rpcUrl: GOERLI_RPC_URL
        },
      ],
    })

    const wallets = await onboard.connectWallet()

    if (wallets[0]) {
      // create an ethers provider with the last connected wallet provider
      const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, 'any')
      const signer = ethersProvider.getSigner()
    }
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
        <h2>Step 1: Invoice</h2>
        <p>Generate a Lightning invoice for the amount you want to receive</p>
        <textarea placeholder="lnbc..." rows="5" onChange={handleTextAreaChange}></textarea>
        <div>
          <div>Amount: {decodedInvoice.human_readable_part.amount} sats ({satsToBitcoin(decodedInvoice.human_readable_part.amount)} BTC)</div>
          <div>Payment Hash: {payment_hash}</div>
        </div>

        <h2>Step 2: Lock WBTC</h2>
        <p>Submitting this transaction will hashlock WBTC into an atomic swap smart contract. We will not be able to unlock your WBTC until we pay your Lightning invoice.</p>
        <button onClick={lockWBTC} disabled={!payment_hash}>Lock WBTC</button>


        <h1>Lightning to WBTC</h1>
      </main>
    </>
  )
}
