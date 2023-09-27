import type { NextPage } from "next";
import Head from "next/head";
import Layout from "../components/layout";
import Bridge from "./bridge";
import { BridgeProvider } from "../contexts/bridge-context";
import { BridgeApiProvider } from "../contexts/bridge-api-context";

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Lightning DEX</title>
        <meta name="description" content="The Lightning to Ethereum Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <BridgeApiProvider>
        <BridgeProvider>
          <Bridge />
        </BridgeProvider>
      </BridgeApiProvider>
    </Layout>
  );
};

export default Home;
