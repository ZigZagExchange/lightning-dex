module.exports = {
  CHAIN_CONFIG: {
    zksyncEra: {
      chainId: 324,
      rpcUrl: 'https://mainnet.era.zksync.io',
    },
    arbitrum: {
      chainId: 42161,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
    },
    goerli: {
      chainId: 5,
      rpcUrl: 'https://goerli.infura.io/v3/3c7f5083c38943ea95aa49278ddeba53',
    }
  },
  NETWORK_FEE: 2000,
  OPEN_CHANNEL_FEE: 50000,
  TRADING_FEE: 0.003
}
