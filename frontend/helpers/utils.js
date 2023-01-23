export function satsToBitcoin(sats) {
  return sats / 1e8;
}

export function bitcoinToSats(bitcoin) {
  return parseInt(bitcoin * 1e8);
}
