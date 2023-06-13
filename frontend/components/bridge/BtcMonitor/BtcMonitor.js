import { useState, useEffect } from "react"

const BtcMonitor = ({ btcDepositAddress, btcHeight }) => {

    const [tx, setTx] = useState("")

    useEffect(() => {
        if (btcDepositAddress) {
            pollAPI(btcDepositAddress)
        }
    }, [btcDepositAddress])

    function checkTransactions(transactions, btcHeight) {
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            if (tx.status && tx.status.block_height >= btcHeight) {
                setTx(tx.txid)
                return tx.txid
            }
        }
    }


    async function pollAPI(btcDepositAddress) {
        let intervalId = setInterval(async() => {

        await fetch('/api/btcAddressTxs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ btcDepositAddress }),
        })
            .then(r => r.json())
            .then(data => {
                if (checkTransactions(data)) {
                    clearInterval(intervalId) // stop polling
                }
            })
            .catch(error => console.error(error))
        }, 15000)
    }

    return (<>
        <p>BtcMonitor</p>
        {tx ? <p>Pending tx: {tx}</p> : <p>Awaiting btc deposit...</p> }
    </>
    );
};

export default BtcMonitor;