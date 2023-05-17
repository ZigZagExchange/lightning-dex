import { useEffect, useState } from "react"
import Image from "next/image"
import styled from "styled-components"

import { networksItems } from "../../../utils/data"

interface props {
  count: number;
}

const NetworkItem: any = styled.div`
  button{
    background-color: #58535B80;
    border-color: #58535B;

    &:hover, &.active {
      background-color: ${(props: any) => props.color + "50"};
      border-color: ${(props: any) => props.color};
    }
  }
`

function NetworkSelector({ count }: props) {
  const [active, setActive] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("")

  useEffect(() => {
    count > 0 && setActive(true)
  }, [count])

  const closeDroplist = () => {
    setSearch("")
    setActive(false)
  }

  return (
    <div className={`droplist origin-bottom absolute bg-bgBase w-full h-full md:w-[95%] md:h-[95%] -ml-0 md:-ml-3 md:mt-3 z-20 rounded-3xl ${active ? "active" : ""}`}>
      <div className="max-h-full pb-4 -mt-3 overflow-auto scrollbar-hide rounded-3xl bg-bgLighter">
        <div className="absolute z-10 w-full px-6 pt-3 bg-primary rounded-t-xl">
          <div className="flex items-center float-right mb-2 font-medium sm:float-none">
            <input
              className="text-white  focus:outline-none hidden sm:inline-block flex-grow h-full min-w-[70%] py-2 pr-2 rounded bg-transparent placeholder-white placeholder-opacity-40"
              placeholder="Search by asset, name, or chainID."
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

        <div className="px-3 pt-20 pb-8 space-y-4 md:px-6 rounded-xl">
          {
            networksItems.map((item, index) =>
              item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
              <NetworkItem color={item.color} key={`${item.name} + ${index}`}>
                <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent" >
                  <Image src={`/tokenIcons/${item.icon}`} alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
                  <div className="flex-col text-left">
                    <div className="text-lg font-medium text-white">{item.name}</div>
                    <div className="text-sm text-white opacity-50">{item.layer}</div>
                  </div>
                </button>
              </NetworkItem>
            )}

          {
            search.length > 0 &&
            <div className="px-12 py-4 text-xl text-center text-white">No other results found for
              <i className="text-white text-opacity-60"> {search}</i>.
              <div className="pt-4 text-lg text-white text-opacity-50 align-bottom text-medium">Want to see a chain supported on Synapse? Submit a request
                <span className="text-white text-opacity-70 hover:underline hover:cursor-pointer">here</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default NetworkSelector