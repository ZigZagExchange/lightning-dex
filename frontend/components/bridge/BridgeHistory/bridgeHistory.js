import { useState, useEffect } from 'react';

function BridgeHistory({ address }) {
    const [responseData, setResponseData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setResponseData(data);
                } else {
                    // Handle non-successful response
                    console.error('Request failed with status:', response.status);
                }
            } catch (error) {
                // Handle fetch error
                console.error('Request failed:', error);
            }
        };

        fetchData();
    }, [address]);

    return (
        <div>
            {responseData.length === 0 ? (
                <p>No history available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Deposit Currency</th>
                            <th>Deposit Amount</th>
                            <th>Deposit Transaction</th>
                            <th>Outgoing Currency</th>
                            <th>Outgoing Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responseData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.deposit_currency}</td>
                                <td>{item.deposit_amount}</td>
                                <td>
                                    <a
                                        href={`https://etherscan.io/tx/${item.deposit_txid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {item.deposit_txid.slice(0, 6)}...{item.deposit_txid.slice(-6)}
                                    </a>
                                </td>
                                <td>{item.outgoing_currency}</td>
                                <td>{item.outgoing_amount || 'Pending'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BridgeHistory;
