import Head from 'next/head'
import React, { useState } from 'react'
import { CHAIN_CONFIG } from '../helpers/constants'
import { connectWallet } from '../helpers/wallet'
import { ethers } from 'ethers'
import { toast } from 'react-toastify';
import Link from 'next/link'

const ERC20_ABI = require('../helpers/ERC20.abi.json');
const BRIDGE_ABI = require('../helpers/BTCBridge.abi.json');

export default function Pool() {
  const [wbtcBalance, setWbtcBalance] = useState(0.0);
  const [lpBalance, setLpBalance] = useState(0.0);


  async function updateBalances () {
    const wallets = await connectWallet();
    const chainId = Number(wallets[0].chains[0].id);
    if (chainId != 42161) {
      return toast.error("wrong network");
    }
    const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, chainId);
    const address = wallets[0].accounts[0].address;

    const WBTC = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcAddress, ERC20_ABI, ethersProvider);
    const Vault = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, BRIDGE_ABI, ethersProvider);

    const wbtcBalance = await WBTC.balanceOf(address);
    setWbtcBalance(wbtcBalance.toString() / 1e8);

    const lpBalance = await Vault.balanceOf(address);
    setLpBalance(lpBalance.toString() / 1e18);
  }

  async function depositWbtc (e: any) {
    const deposit_amount = (document.getElementById("wbtc-deposit-amount") as HTMLInputElement)?.valueAsNumber
    if (deposit_amount > wbtcBalance) {
      return toast.error("not enough balance");
    }

    const wallets = await connectWallet();
    const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, Number(wallets[0].chains[0].id))
    const address = wallets[0].accounts[0].address;

    const WBTC = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcAddress, ERC20_ABI, ethersProvider);
    const WBTCSigner = WBTC.connect(ethersProvider.getSigner());
    const Vault = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, BRIDGE_ABI, ethersProvider);
    const VaultSigner = Vault.connect(ethersProvider.getSigner());

    const allowance = await WBTC.allowance(address, CHAIN_CONFIG.arbitrum.wbtcVaultAddress);
    const depositAmountBN = ethers.BigNumber.from(deposit_amount * 1e8);
    if (depositAmountBN.gt(allowance)) {
      const approveTx = await WBTCSigner.approve(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, ethers.constants.MaxUint256);
      const allowanceToast = toast.info("Waiting on approval");
      await approveTx.wait();
      toast.dismiss(allowanceToast);
    }
    const depositTx = await VaultSigner.depositWBTCToLP(depositAmountBN);
    await depositTx.wait();
    await updateBalances();
  }

  async function withdrawLP (e: any) {
    const withdraw_amount = (document.getElementById("lp-withdraw-amount") as HTMLInputElement)?.valueAsNumber
    if (withdraw_amount > lpBalance) {
      return toast.error("not enough balance");
    }

    const wallets = await connectWallet();
    const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, Number(wallets[0].chains[0].id))
    const address = wallets[0].accounts[0].address;

    const WBTC = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcAddress, ERC20_ABI, ethersProvider);
    const WBTCSigner = WBTC.connect(ethersProvider.getSigner());
    const Vault = new ethers.Contract(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, BRIDGE_ABI, ethersProvider);
    const VaultSigner = Vault.connect(ethersProvider.getSigner());

    const allowance = await Vault.allowance(address, CHAIN_CONFIG.arbitrum.wbtcVaultAddress);
    const withdrawAmountBN = ethers.BigNumber.from((withdraw_amount * 1e18).toFixed(0));
    if (withdrawAmountBN.gt(allowance)) {
      const approveTx = await VaultSigner.approve(CHAIN_CONFIG.arbitrum.wbtcVaultAddress, ethers.constants.MaxUint256);
      const allowanceToast = toast.info("Waiting on approval", { autoClose: false });
      await approveTx.wait();
      await toast.dismiss(allowanceToast);
    }
    const withdrawTx = await VaultSigner.withdrawWBTCFromLP(withdrawAmountBN);
    await withdrawTx.wait();
    await updateBalances();
  }

  return (
    <>
      <Head>
        <title>Lightning DEX - Pool</title>
        <meta name="description" content="LP on the Lightning exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <nav>
          <Link href="/">Swap</Link>&nbsp;
          <Link href="/pool">Pool</Link>
        </nav>
        <h1>WBTC LP Pool</h1>
        <p><button onClick={updateBalances}>Update Balances</button></p>
        <table className="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Balance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>WBTC</td>
              <td>{wbtcBalance}</td>
              <td>
                <input type="number" id="wbtc-deposit-amount" placeholder="0.0" />
                <button onClick={depositWbtc}>Deposit</button>
              </td>
            </tr>
            <tr>
              <td>ZWBTCLP</td>
              <td>{lpBalance}</td>
              <td>
                <input type="number" id="lp-withdraw-amount" placeholder="0.0" />
                <button onClick={withdrawLP}>Withdraw</button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  )
}
