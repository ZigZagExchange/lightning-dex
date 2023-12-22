import { useState } from "react";
import Layout from "../../components/layout";
import Head from "next/head";
import ProvideLiquidity from "./provide";
import RemoveLiquidity from "./remove";

function LiquidityPage() {
  const [activeTab, setActiveTab] = useState<"provide" | "remove">("provide");

  return (
    <Layout>
      <Head>
        <title>Zap Bridge</title>
        <meta name="description" content="The zap cross chain bridge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="pb-3 place-self-center w-[500px]">
        <div className="flex items-center justify-between mb-5 ml-5 mr-5 space-x-2">
          <div>
            <div className="text-2xl font-medium text-white">
              {activeTab === "provide"
                ? "Deposit your Bitcoin"
                : "Withdraw your Bitcoin"}
            </div>

            <div className="text-base text-white text-opacity-50">
              {activeTab === "provide"
                ? "Provide your ethereum address to receive your LP tokens."
                : "Burn your LP tokens and redeem your Bitcoin."}
            </div>
          </div>
        </div>
        <div className="pt-3 max-w-lg px-1 pb-1 -mb-3 rounded-xl bg-bgBase md:px-6 lg:px-6">
          <div className="mb-8">
            <div className="flex">
              <button
                className={`group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight ${
                  activeTab === "provide"
                    ? "bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF]"
                    : "bg-white bg-opacity-10"
                } false`}
                type="button"
                onClick={() => setActiveTab("provide")}
              >
                Provide
              </button>
              <button
                className={`group cursor-pointer outline-none focus:outline-none active:outline-none ring-none duration-100 transform-gpu w-full rounded-lg my-2 px-4 py-3 text-white text-opacity-100 transition-all hover:opacity-80 disabled:opacity-100 disabled:text-[#88818C] disabled:from-bgLight disabled:to-bgLight ${
                  activeTab === "remove"
                    ? "bg-gradient-to-r from-[#CF52FE] to-[#AC8FFF]"
                    : "bg-white bg-opacity-10"
                } false`}
                type="button"
                onClick={() => setActiveTab("remove")}
              >
                Remove
              </button>
            </div>
            {activeTab === "provide" && <ProvideLiquidity />}
            {activeTab === "remove" && <RemoveLiquidity />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LiquidityPage;
