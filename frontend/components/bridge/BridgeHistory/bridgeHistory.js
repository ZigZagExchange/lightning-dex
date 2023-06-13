import { useState, useEffect } from 'react'

function BridgeHistory({ address }) {
    const [responseData, setResponseData] = useState([])

    const renderLink = (item) => {
        if (item.deposit_currency === 'ETH') {
            return (
                <a
                    href={`https://etherscan.io/tx/${item.deposit_txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.deposit_txid.slice(0, 6)}...{item.deposit_txid.slice(-6)}
                </a>
            )
        } else if (item.deposit_currency === 'BTC') {
            return (
                <a
                    href={`https://mempool.space/tx/${item.deposit_txid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.deposit_txid.slice(0, 6)}...{item.deposit_txid.slice(-6)}
                </a>
            )
        } else {
            return 'N/A'
        }
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

    return (
        <div>
            {responseData.length === 0 ? (
                <p>No history available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Deposit Timestamp</th>
                            <th>Deposit Currency</th>
                            <th>Deposit Amount</th>
                            <th>Deposit Transaction</th>
                            <th>Outgoing Currency</th>
                            <th>Outgoing Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responseData.reverse().map((item, index) => (
                            <tr key={index}>
                                <td>{formatDate(item.deposit_timestamp)}</td>
                                <td>{item.deposit_currency}</td>
                                <td>{item.deposit_amount}</td>
                                <td>{renderLink(item)}</td>
                                <td>{item.outgoing_currency}</td>
                                <td>{item.outgoing_amount || 'Pending'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default BridgeHistory
