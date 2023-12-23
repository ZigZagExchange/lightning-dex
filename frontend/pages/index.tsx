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
        <title>Zap Bridge</title>
        <meta name="description" content="The zap cross chain bridge" />
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
