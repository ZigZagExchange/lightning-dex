export const networksItems = [
    {
        id: 1,
        name: "Ethereum",
        token: "2170ed0880ac9a755fd29b2688956bd959f933f8",
        layer: "Layer 1",
        color: "#5170ad",
        icon: "eth.svg"
    },
    //{
    //    id: 42161,
    //    name: "Arbitrum",
    //    token: "912CE59144191C1204E64559FE8253a0e49E6548",
    //    layer: "Layer 2",
    //    color: "#58535B",
    //    icon: "abt.jfif"
    //},
    {
        id: 2,
        name: "Solana",
        token: "912CE59144191C1204E64559FE8253a0e49E6548",
        layer: "Layer 1",
        color: "#58535B",
        icon: "sol.svg"
    },
    {
        id: 3,
        name: "Bitcoin",
        token: "912CE59144191C1204E64559FE8253a0e49E6548",
        layer: "Layer 1",
        color: "#58535B",
        icon: "btc.svg"
    },
    //{
    //    id: 4,
    //    name: "Lightning",
    //    token: "912CE59144191C1204E64559FE8253a0e49E6548",
    //    layer: "Layer 2",
    //    color: "#58535B",
    //    icon: "ln.jfif"
    //},
]

export const depositContractABI = [{ "inputs": [{ "internalType": "address", "name": "_beneficiary", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "initiator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "out_chain", "type": "string" }, { "indexed": false, "internalType": "string", "name": "out_address", "type": "string" }], "name": "Deposit", "type": "event" }, { "inputs": [], "name": "beneficiary", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "string", "name": "out_chain", "type": "string" }, { "internalType": "string", "name": "out_address", "type": "string" }], "name": "depositERC20", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "out_chain", "type": "string" }, { "internalType": "string", "name": "out_address", "type": "string" }], "name": "depositETH", "outputs": [], "stateMutability": "payable", "type": "function" }]

export const ETH_BTC_CONTRACT = "0x64Ca3FCa3B43c98F12A9E9509f9cF8AB18abc208"
