import type { NextPage } from "next"
import Head from "next/head"
import Layout from "../components/layout/Layout"
import Swap from "../components/swap/Swap"

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Lightning DEX</title>
        <meta name="description" content="The Lightning to Ethereum Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Swap />
    </Layout>
  )
}

export default Home
