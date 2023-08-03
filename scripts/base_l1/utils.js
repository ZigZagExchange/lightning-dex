import { ethers } from 'ethers'
import BN from 'bignumber.js'

const WAD = '1000000000000000000'

export function generateEthKeyPairFromID (id) {
  const masterWallet = ethers.utils.HDNode.fromSeed(Buffer.from(process.env.BASE_BRDIGE_SECRET))
  const derivationIndex = ethers.utils.keccak256(Buffer.from(id)).substring(0, 10);
  const derivedWallet = masterWallet.derivePath(`m/44'/60'/0'/0/${parseInt(derivationIndex, 16) & 0x7fffffff}`)
  return {
    privateKey: derivedWallet.privateKey,
    publicKey: derivedWallet.address
  }
}

export function WADToAmount (input) {
  return new BN(input).div(WAD).toNumber()
}

export function amountTOWAD (input) {
  return new BN(input).times(WAD).toString()
}