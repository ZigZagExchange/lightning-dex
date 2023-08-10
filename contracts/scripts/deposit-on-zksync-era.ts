import {ethers} from 'ethers'
import contractArtifact from '../artifacts/contracts/BTCBridge.sol/BTCBridge.json'

const CONTRTACT_ADDRESS = '0x828c7457A0d45Fe3D06B9c774838D1E451DDA74B'
const USER_PRVATE_KEY = '23e8ad617574796f083547efcd80da6cc5c1d8cf9074e2d81d026865d481df27'
const AMOUNT = '0.01'
const OUT_CURRENCY = 'ETH'
const OUT_ADDRESS = '0x26AFeEBc8012FD47521c955cfAd6d6172B06516C'

async function runScript () {
  const provider = new ethers.providers.JsonRpcProvider('https://testnet.era.zksync.dev')
  const wallet = new ethers.Wallet(USER_PRVATE_KEY, provider)
  const contract = new ethers.Contract(CONTRTACT_ADDRESS, contractArtifact.abi, wallet)

  const gasPrice = await provider.getGasPrice()

  const tx = await contract.depositETH(OUT_CURRENCY, OUT_ADDRESS, {
    value: ethers.utils.parseEther(AMOUNT),
    from: wallet.address,
    gasPrice: gasPrice,
    gasLimit: 200000
  })

  await tx.wait()

  console.log(tx.hash)
}

runScript()