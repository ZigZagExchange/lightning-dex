import { useState, useEffect } from "react"

const BtcMonitor = ({ btcDepositAddress, btcHeight }) => {

    useEffect(() => {
        if (btcDepositAddress) {
            pollAPI(btcDepositAddress)
        }
    }, [btcDepositAddress])

    async function pollAPI(btcDepositAddress) {
        // let intervalId = setInterval(() => {

        await fetch('/api/btcAddressTxs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ btcDepositAddress }),
        })
            .then(r => r.json())
            .then(data => {
                console.log(data)
            })
            .catch(error => console.error(error))
        // }, 15000)
    }

    return (<>
        <p>BtcMonitor</p>
        <p>{btcDepositAddress}</p>
        <p>{btcHeight}</p>
    </>
    );
};

export default BtcMonitor;