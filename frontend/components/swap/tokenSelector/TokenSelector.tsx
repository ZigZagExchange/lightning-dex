import { useEffect, useState } from "react"
import Image from "next/image"

interface props {
  count: number
}

function TokenSelector({ count }: props) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
  }, [count])

  return (
    <div className={`droplist origin-bottom absolute w-full h-full md:w-[95%] md:h-[95%] -ml-0 md:-ml-3 md:mt-3 bg-[#333] z-20 rounded-3xl ${active ? "active" : ""}`}>
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

        <div className="px-3 pt-20 pb-8 space-y-4 bg-primaryer md:px-6 rounded-xl">
          <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-[#5170ad] hover:!bg-opacity-20 hover:!border-[#5170ad] bg-[#5170ad] hover:bg[#3f4f8c] active:bg-[#314367] border-[#5170ad] dark:border-[#5170ad] bg-opacity-50">
            <Image src="/tokenIcons/eth.svg" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Ethereum</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent bg-opacity-40 hover:!bg-opacity-20 hover:!border-gray-500 bg-[#58535B] hover:bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/abt.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Arbitrum</div>
              <div className="text-sm text-white opacity-50">Layer 2</div>
            </div>
          </button>

          <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-red-500 bg-opacity-40 hover:!bg-opacity-20 hover:!border-red-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/avax.svg" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Avalanche</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-[#ecae0b] bg-opacity-40 hover:!bg-opacity-20 hover:!border-[#ecae0b] bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/bnb.svg" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">BNB Chain</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-red-500 bg-opacity-40 hover:!bg-opacity-20 hover:!border-red-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/opt.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Optimism</div>
              <div className="text-sm text-white opacity-50">Layer 2</div>
            </div>
          </button>

          <button className="flex items-center transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-purple-500 bg-opacity-40 hover:!bg-opacity-20 hover:!border-purple-500 bg-[#58535B]  active:bg-[#58535B]">
            <Image src="/tokenIcons/pol.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Polygon</div>
              <div className="text-sm text-white opacity-50">Layer 2</div>
            </div>
          </button>

          <button className=" flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-lime-500 hover:!bg-opacity-20 hover:!border-lime-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/aur.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Aurora</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-lime-500 hover:!bg-opacity-20 hover:!border-lime-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/bob.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Boba Network</div>
              <div className="text-sm text-white opacity-50">Layer 2</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-teal-500 hover:!bg-opacity-20 hover:!border-teal-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/canto.svg" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Canto</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-blue-500 hover:!bg-opacity-20 hover:!border-blue-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/cronos.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Cronos</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-lime-500 hover:!bg-opacity-20 hover:!border-lime-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/dfk.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">DFK Chain</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-purple-500 hover:!bg-opacity-20 hover:!border-purple-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/dog.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Dogechain</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-blue-500 hover:!bg-opacity-20 hover:!border-blue-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/fantom.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Fantom</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-cyan-500 hover:!bg-opacity-20 hover:!border-cyan-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/harmony.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Harmony</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-orange-500 hover:!bg-opacity-20 hover:!border-orange-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/klaytn.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Klaytn</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-teal-500 hover:!bg-opacity-20 hover:!border-teal-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/metis.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Metis</div>
              <div className="text-sm text-white opacity-50">Layer 2</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-teal-500 hover:!bg-opacity-20 hover:!border-teal-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/moonbeam.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Moonbeam</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-purple-500 hover:!bg-opacity-20 hover:!border-purple-500 bg-[#58535B]  active:bg-[#58535B]">
            <Image src="/tokenIcons/moonriver.jfif" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Moonriver</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>

          <button className="flex items-center bg-opacity-40 transition-all duration-75 w-full rounded-xl px-2 py-3 cursor-pointer border border-transparent hover:!bg-blue-500 hover:!bg-opacity-20 hover:!border-blue-500 bg-[#58535B] active:bg-[#58535B]">
            <Image src="/tokenIcons/terra.png" alt="Switch Network" width={40} height={40} className="w-10 h-10 ml-2 mr-4 rounded-full" />
            <div className="flex-col text-left">
              <div className="text-lg font-medium text-white">Terra</div>
              <div className="text-sm text-white opacity-50">Layer 1</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TokenSelector