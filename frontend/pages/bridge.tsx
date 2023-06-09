import type { NextPage } from "next"
import Head from "next/head"
import Layout from "../components/layout/Layout"
import Bridge from "../components/bridge/Bridge"

const Home: NextPage = () => {
    return (
        <Layout>
            <Head>
                <title>Lightning DEX</title>
                <meta name="description" content="The Lightning to Ethereum Exchange" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Bridge />
        </Layout>
    )
}

export default Home