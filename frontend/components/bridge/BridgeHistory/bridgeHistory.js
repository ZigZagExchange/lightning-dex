import { useState, useEffect } from 'react'
import Image from "next/image"

function BridgeHistory({ address }) {
    const [responseData, setResponseData] = useState([])

    const getExplorerLink = (currency, txid) => {
        if (currency === 'ETH') return `https://etherscan.io/tx/${txid}`
        else if (currency === 'BTC') return `https://mempool.space/tx/${txid}`
        else if (currency === 'SOL') return `https://solscan.io/tx/${txid}`
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleString()
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address }),
                })

                if (response.ok) {
                    const data = await response.json()
                    // Sort items by timestamp in descending order
                    data.sort((a, b) => new Date(b.deposit_timestamp) - new Date(a.deposit_timestamp))
                    setResponseData(data)
                } else {
                    // Handle non-successful response
                    console.error('Request failed with status:', response.status)
                }
            } catch (error) {
                // Handle fetch error
                console.error('Request failed:', error)
            }
        }

        fetchData()
    }, [address])

    if (address && responseData.length > 0) {
      return (
          <div>
            <div className="ml-3 mb-9 text-2xl font-medium text-white">History</div>

            {responseData.reverse().slice(0,3).map((item, index) => (
                <div key={index} className="flex justify-around -mt-4 p-2 text-md text-[#D8D1DC] rounded-xl bg-bgBase">
                    <a className="p-4" href={getExplorerLink(item.deposit_currency, item.deposit_txid)} target="_blank">
                      <span className="text-lg cursor-pointer">{item.deposit_amount}</span>
                      <img
                        src={`/tokenIcons/${item.deposit_currency.toLowerCase()}.svg`}
                        alt="ether"
                        width={22}
                        height={22}
                        className="w-8 h-8 rounded-full my-1 opacity-80 cursor-pointer"
                      />
                    </a>
                    <Image src="/white-arrows-right.png" alt="-->" className="self-center w-10 h-10" width="30" height="30" />
                    <a className="p-4" href={getExplorerLink(item.outgoing_currency, item.outgoing_txid)} target="_blank">
                      <span className="text-lg">{Number(item.outgoing_amount).toPrecision(6) || 'Pending'}</span>
                      <Image
                        src={`/tokenIcons/${item.outgoing_currency.toLowerCase()}.svg`}
                        alt="ether"
                        width={22}
                        height={22}
                        className="w-8 h-8 my-1 rounded-full md:mr-1 opacity-80 align-right"
                      />
                    </a>
                </div>
            ))}
          </div>
      )
    }
    else return ""
}

export default BridgeHistory
