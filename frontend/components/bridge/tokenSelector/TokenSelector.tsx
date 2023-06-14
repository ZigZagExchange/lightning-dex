import { useEffect, useState } from "react"
import Image from "next/image"
import styled from "styled-components"
import { networksItems } from "../../../utils/data"

interface props {
  count: number,
  onSelect?: (item: any) => void,
  networkID?: number
}

export const evmTokenItems = [
  {
    name: "ETH",
    base: "Ethereum",
    network: "Ethereum",
    address: ['', ''],
    numOfDecimals: 18,
    bg: "#0ea5e9",
    border: "#7dd3fc",
    icon: "eth.svg",
    networkIcon: "eth.svg",
    priceKey: "eth_usd",
    maxSize: 1,
    minSize: 0.004,
    networkFee: 0.002
  },
  //{
  //  name: "USDC",
  //  base: "USD Circle",
  //  network: "Ethereum",
  //  address: [
  //    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  //    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'
  //  ],
  //  numOfDecimals: 18,
  //  bg: "#3b82f6",
  //  border: "#93c5fd",
  //  icon: "usdc.svg",
  //  networkIcon: "eth.svg"
  //},
  //{
  //  name: "USDT",
  //  base: "USD Tether",
  //  network: "Ethereum",
  //  address: [
  //    '0xdac17f958d2ee523a2206206994597c13d831ec7',
  //    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
  //  ],
  //  numOfDecimals: 6,
  //  bg: "#22c55e",
  //  border: "#86efb6",
  //  icon: "usdt.svg",
  //  networkIcon: "eth.svg"
  //},
  //{
  //  name: "WBTC",
  //  base: "Wrapped Bitcoin",
  //  network: "Ethereum",
  //  address: [
  //    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  //    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f'
  //  ],
  //  numOfDecimals: 8,
  //  bg: "#EAB308",
  //  border: "#EAB308",
  //  icon: "wbtc.svg",
  //  networkIcon: "eth.svg"
  //},
]

export const solTokenItems = [
  {
    name: "SOL",
    base: "Solana",
    network: "Solana",
    address: [
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    ],
    numOfDecimals: 9,
    bg: "#0ea5e9",
    border: "#7dd3fc",
    icon: "sol.svg",
    networkIcon: "sol.svg",
    priceKey: "sol_usd",
    maxSize: 100,
    minSize: 0.3,
    networkFee: 0.001
  },
  //{
  //  name: "USDC",
  //  base: "USD Circle",
  //  network: "Solana",
  //  address: [
  //    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  //    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  //  ],
  //  numOfDecimals: 18,
  //  bg: "#3b82f6",
  //  border: "#93c5fd",
  //  icon: "usdc.svg",
  //  networkIcon: "eth.svg"
  //},
  //{
  //  name: "USDT",
  //  base: "USD Tether",
  //  network: "Solana",
  //  address: [
  //    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  //    'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  //  ],
  //  numOfDecimals: 18,
  //  bg: "#22c55e",
  //  border: "#86efb6",
  //  icon: "usdt.svg",
  //  networkIcon: "eth.svg"
  //},
]

export const btcTokenItems = [
  {
    name: "BTC",
    base: "Bitcoin",
    network: "Bitcoin",
    address: ['', ''],
    numOfDecimals: 8,
    bg: "#0ea5e9",
    border: "#7dd3fc",
    icon: "btc.svg",
    networkIcon: "btc.svg",
    priceKey: "btc_usd", 
    maxSize: 0.1,
    minSize: 0.0003,
    networkFee: 0.0001
  },
]

const TokenItem: any = styled.div`
  > div {
    background-color: #58535B80;
    border-color: #58535B;

    &:hover, &.active {
      background-color: ${(props: any) => props.bg + "50"};
      border-color: ${(props: any) => props.border};
    }
  }
`

function TokenSelector({ count, onSelect, networkID }: props) {
  const [tokenItems, setTokenItems] = useState(evmTokenItems)
  const [active, setActive] = useState(false)
  const [search, setSearch] = useState<string>("")
  const network = networksItems.find(item => item.id === networkID) as any

  useEffect(() => {
    if (networkID === 1 || networkID === 42161) {
      setTokenItems(evmTokenItems)
    } else if (networkID === 2) {
      setTokenItems(solTokenItems)
    } else {
      setTokenItems(btcTokenItems)
    }
  }, [networkID])

  useEffect(() => {
    count > 0 && setActive(true)
  }, [count])

  const closeDroplist = () => {
    setSearch("")
    setActive(false)
  }

  const onActive = (item: any) => {
    if (onSelect) {
      onSelect(item)
      setActive(false)
    }
  }

  if (!network) return null

  return (
    <div className={`droplist origin-bottom absolute w-full h-full md:w-[95%] md:h-[95%] -ml-0 md:-ml-3 md:mt-3 bg-bgBase z-20 rounded-3xl ${active ? "active" : ""}`}>
      <div className="max-h-full pb-4 -mt-3 overflow-auto scrollbar-hide rounded-3xl">
        <div className="absolute z-10 w-full px-6 pt-3 bg-primary rounded-t-xl">
          <div className="flex items-center float-right mb-2 font-medium sm:float-none">
            <input
              className="text-white  focus:outline-none hidden sm:inline-block flex-grow h-full min-w-[70%] py-2 pr-2 rounded bg-transparent placeholder-white placeholder-opacity-40"
              placeholder="Search by symbol, contract, or name..."
              value={search}
              onChange={(e: React.FormEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
            />

            <div className="flex items-center justify-center w-8 h-8 float-right group hover:cursor-pointer rounded-full bg-white bg-opacity-10" onClick={closeDroplist}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="inline w-6 text-white transition transform-gpu group-hover:opacity-50 group-active:rotate-180">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-bgLighter space-y-4 pt-20 pb-8 px-2 md:px-6 rounded-3xl">
          {
            tokenItems.map((item, index) =>
              item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
              <TokenItem key={`${item.name} - ${index}`} bg={item.bg} border={item.border}>
                <div className="flex items-center transition-all bg-opacity-40 duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:border-orange-300 hover:bg-orange-50 focus:bg-orange-50 active:bg-orange-50 dark:hover:bg-opacity-20 dark:focus:bg-opacity-20 dark:active:bg-opacity-20  dark:hover:bg-orange-500 dark:focus:bg-orange-500 dark:active:bg-orange-500 bg-[#58535B]"
                  onClick={() => onActive(item)}
                >
                  <div className="flex items-center w-full">
                    <Image alt="token" className="w-10 h-10 ml-2 mr-4 rounded-full" src={`/tokenIcons/${item.icon}`} width={40} height={40} />
                    <div className="flex-col text-left">
                      <div className="text-lg font-medium text-white">{item.name}</div>
                      <div className="flex items-center text-sm text-white">
                        <div className="mr-1 opacity-70">{item.base}</div>
                        <div className="opacity-60">on</div>

                        <Image alt="token" src={`/tokenIcons/${network.icon}`} className="w-4 h-4 ml-2 mr-2 rounded-full" width={16} height={16} />
                        <div className="hidden md:inline-block opacity-70">{network.name}</div>
                      </div>
                    </div>

                    <div className="ml-auto mr-5 text-lg text-white">
                    </div>
                  </div>
                </div>
              </TokenItem>
            )
          }

          {
            search.length > 0 &&
            <div className="px-12 py-4 text-xl text-center text-white">No other results found for
              <i className="text-white text-opacity-60"> {search}</i>.

              <div className="pt-4 text-lg text-white text-opacity-50 align-bottom text-medium">
                Want to see a token supported on Synapse? Submit a request
                <span className="text-white text-opacity-70 hover:underline hover:cursor-pointer">here</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default TokenSelector
