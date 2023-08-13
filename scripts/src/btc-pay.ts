import { generateUSDPriceMap, getOutgoingAmountAndFee } from "./pricing";
import { scriptWrapper } from "./wrapper";
import nodeChildProcess from 'node:child_process'
import util from 'node:util'

const SCRIPT_INTERVAL = 10000

const exec = util.promisify(nodeChildProcess.exec);

const runScript = scriptWrapper(async ({db}) => {
  const {rows: bridges} = await db.query("SELECT * FROM bridges WHERE paid = false AND outgoing_currency = 'BTC' AND outgoing_address IS NOT NULL")

  if (bridges.length === 0) {
    return
  }

  const usdPriceMap = await generateUSDPriceMap()
  const feeCheck = await exec(`${process.env.BITCOIN_CLI_PREFIX} estimatesmartfee 1`);
  const networkFee = JSON.parse(feeCheck.stdout).feerate / 3; // Estimated 333 vB

  for (let bridge of bridges) {
    const {amountMinusFee, fee, outgoingAmount} = getOutgoingAmountAndFee(usdPriceMap, bridge.deposit_currency, bridge.outgoing_currency, bridge.deposit_amount)
    const balanceCheck = await exec(`${process.env.BITCOIN_CLI_PREFIX} getwalletinfo`);
    const walletInfo = JSON.parse(balanceCheck.stdout);

    if (walletInfo.balance < amountMinusFee) {
      console.log('BTC liquidity is empty')
      continue
    }

    const duplicates = await db.query("SELECT * FROM bridges WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (duplicates.rowCount !== 1) {
      throw new Error(`double deposit detected ${bridge.deposit_txid}`)
    }

    const updatePaid = await db.query("UPDATE bridges SET paid=true WHERE deposit_txid = $1", [bridge.deposit_txid]);
    if (updatePaid.rowCount !== 1) {
      throw new Error("Weird failure in paid update");
    }

    if (amountMinusFee <= 0) {
      console.log("Payment skipped. Outgoing amount would be negative");
      continue
    }

    let btcPayment;
    try {
      const amount = (amountMinusFee - networkFee).toFixed(8)
      btcPayment = await exec(`${process.env.BITCOIN_CLI_PREFIX} -named sendtoaddress address=${bridge.outgoing_address} amount=${amount} conf_target=1`);
    } catch (e) {
      console.error("Trade failed");
      console.error(e);
      continue;
    }
    const outgoingTxid = btcPayment.stdout.trim();

    const updateResult = await db.query(
      "UPDATE bridges SET outgoing_txid=$1, outgoing_amount=$2, outgoing_timestamp=NOW() WHERE deposit_txid = $3", 
      [outgoingTxid, outgoingAmount, bridge.deposit_txid]
    );

    if (updateResult.rowCount === 1) {
      console.log(`${bridge.deposit_currency} to ${bridge.outgoing_currency} executed ${outgoingTxid}`)
    }
  }
})

runScript()
setInterval(() => {
  runScript()
}, SCRIPT_INTERVAL)
