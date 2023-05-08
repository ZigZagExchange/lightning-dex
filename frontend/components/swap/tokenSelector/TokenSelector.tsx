import { useEffect, useState } from "react"
import Image from "next/image"

interface props {
  count: number
}

function TokenSelector({ count }: props) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    count > 0 && setActive(true)
  }, [count])

  return (
    <div className={`droplist origin-bottom absolute w-full h-full md:w-[95%] md:h-[95%] -ml-0 md:-ml-3 md:mt-3 bg-bgBase z-20 rounded-3xl ${active ? "active" : ""}`}>
      <div className="max-h-full pb-4 -mt-3 overflow-auto scrollbar-hide rounded-3xl">
        <div className="absolute z-10 w-full px-6 pt-3 bg-primary rounded-t-xl">
          <div className="flex items-center float-right mb-2 font-medium sm:float-none">
            <input className="text-white  focus:outline-none hidden sm:inline-block flex-grow h-full min-w-[70%] py-2 pr-2 rounded bg-transparent placeholder-white placeholder-opacity-40" placeholder="Search by asset, name, or chainID." />

            <div className="flex items-center justify-center w-8 h-8 float-right group hover:cursor-pointer rounded-full bg-white bg-opacity-10" onClick={() => setActive(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" className="inline w-6 text-white transition transform-gpu group-hover:opacity-50 group-active:rotate-180">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-bgLighter space-y-4 pt-20 pb-8 px-2 md:px-6 rounded-3xl">
          <div className="flex items-center transition-all bg-opacity-40 duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:border-orange-300 hover:bg-orange-50 focus:bg-orange-50 active:bg-orange-50 dark:hover:bg-opacity-20 dark:focus:bg-opacity-20 dark:active:bg-opacity-20  dark:hover:bg-orange-500 dark:focus:bg-orange-500 dark:active:bg-orange-500 bg-[#58535B]
      ">
            <div className="flex items-center w-full">
              <Image alt="token" className="w-10 h-10 ml-2 mr-4 rounded-full" src="/tokenIcons/dai.svg" width={40} height={40} />
              <div className="flex-col text-left">
                <div className="text-lg font-medium text-white">DAI</div><
                  div className="flex items-center text-sm text-white">
                  <div className="mr-1 opacity-70">Dai</div>
                  <div className="opacity-60">on</div>

                  <Image alt="token" src="/tokenIcons/eth.svg" className="w-4 h-4 ml-2 mr-2 rounded-full" width={16} height={16} />
                  <div className="hidden md:inline-block opacity-70">Ethereum</div>
                </div>
              </div>

              <div className="ml-auto mr-5 text-lg text-white">
              </div>
            </div>
          </div>

          <div className="flex items-center transition-all bg-opacity-40 duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:border-blue-300 hover:bg-blue-50 focus:bg-blue-50 active:bg-blue-50  dark:hover:bg-opacity-20 dark:focus:bg-opacity-20 dark:active:bg-opacity-20  dark:hover:bg-blue-500 dark:focus:bg-blue-500 dark:active:bg-blue-500 bg-bgLight ">
            <div className="flex items-center w-full">
              <Image alt="token" className="w-10 h-10 ml-2 mr-4 rounded-full" src="/tokenIcons/usdc.svg" width={40} height={40} />
              <div className="flex-col text-left">
                <div className="text-lg font-medium text-white">USDC</div><
                  div className="flex items-center text-sm text-white">
                  <div className="mr-1 opacity-70">USD Circle</div>
                  <div className="opacity-60">on</div>

                  <Image alt="token" src="/tokenIcons/eth.svg" className="w-4 h-4 ml-2 mr-2 rounded-full" width={16} height={16} />
                  <div className="hidden md:inline-block opacity-70">Ethereum</div>
                </div>
              </div>

              <div className="ml-auto mr-5 text-lg text-white">
              </div>
            </div>
          </div>

          <div className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:border-green-300 hover:bg-green-50 focus:bg-green-50 active:bg-green-50  dark:hover:bg-opacity-20 dark:focus:bg-opacity-20 dark:active:bg-opacity-20  dark:hover:bg-green-500 dark:focus:bg-green-500 dark:active:bg-green-500 bg-[#58535B]">
            <div className="flex items-center w-full">
              <Image alt="token" className="w-10 h-10 ml-2 mr-4 rounded-full" src="/tokenIcons/usdt.svg" width={40} height={40} />
              <div className="flex-col text-left">
                <div className="text-lg font-medium text-white">USDT</div><
                  div className="flex items-center text-sm text-white">
                  <div className="mr-1 opacity-70">USD Tether</div>
                  <div className="opacity-60">on</div>

                  <Image alt="token" src="/tokenIcons/eth.svg" className="w-4 h-4 ml-2 mr-2 rounded-full" width={16} height={16} />
                  <div className="hidden md:inline-block opacity-70">Ethereum</div>
                </div>
              </div>

              <div className="ml-auto mr-5 text-lg text-white">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenSelector