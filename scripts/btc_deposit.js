import nodeChildProcess from 'node:child_process'
import util from 'node:util'

const exec = util.promisify(nodeChildProcess.exec);

const { stdout, stderr } = await exec(`bitcoin-core.cli -testnet listtransactions`);
const transactions = JSON.parse(stdout);
const deposits = transactions.filter(t => t.category === "receive");
console.log(deposits);
