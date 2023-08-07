import {Pool} from 'pg'
import dotenv from 'dotenv'
import {ethers} from 'ethers'
import * as Sentry from '@sentry/node'
import {Connection} from '@solana/web3.js'

dotenv.config()

Sentry.init({
  dsn: "https://021ad227f4dff7fce387149151935f30@o4505659285504000.ingest.sentry.io/4505659286749184",
});

interface Options {
  db: Pool,
  ethProvider: ethers.providers.InfuraProvider,
  solConnection: Connection
}

const db = new Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: 'postgres'
});

const ethProvider = new ethers.providers.InfuraProvider(
  process.env.ETH_NETWORK,
  process.env.INFURA_PROJECT_ID,
);

const solConnection = new Connection(
  process.env.SOLANA_CONNECTION_URL as string,
  "confirmed"
);

export const scriptWrapper = (callback: (options: Options) => void) => {
  return async () => {
    try {
      await callback({db, ethProvider, solConnection})
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }
}