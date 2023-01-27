module.exports = {
  CHAIN_CONFIG: {
    arbitrum: {
      chainId: 42161,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      wbtcAddress: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
      wbtcVaultAddress: '0x888bc0D57727b74d42FB3a06B647FDeA8A06bB3B',
    },
    goerli: {
      chainId: 5,
      rpcUrl: 'https://goerli.infura.io/v3/3c7f5083c38943ea95aa49278ddeba53',
      wbtcAddress: "0x1DF4feb27f0E99F0011A4564Cf7230D3E73c9d6d",
      wbtcVaultAddress: "0x77b03e0f8Af662cE284988676F5683A65894E9c2",
    }
  },
  NETWORK_FEE: 50000,
  OPEN_CHANNEL_FEE: 50000,
  TRADING_FEE: 0.003
}
