import React, { useState } from "react";
import { styled } from 'styled-components'

const StyledInput = styled.input`
background-color: black;
`

function GenerateBtcDeposit() {

    const [inputValue, setInputValue] = useState("");
    const [btcDepositAddress, setBtcDepositAddress] = useState("")

    const handleSubmit = async (event) => {
        event.preventDefault()
        console.log(`Form submitted: ${inputValue}`);
        await getBtcAddress(inputValue)
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const getBtcAddress = async function (ethAddress) {
        await fetch('/api/makeBtcDeposit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ethAddress }),
        })
            .then(r => r.json())
            .then(res => {
                console.log(res.deposit_address)
                setBtcDepositAddress(res.deposit_address)
            })
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="input-field">Input:</label>
                <input
                    id="input-field"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <button type="submit">Submit</button>
            </form>
            {btcDepositAddress ? <p>{btcDepositAddress}</p> : null}
        </>
    );
}

export default GenerateBtcDeposit