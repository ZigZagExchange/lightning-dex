import { useState } from "react"
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { utils } from 'ethers'
import { styled } from 'styled-components'
import { useDebounce } from 'use-debounce'

export function SendTransaction() {
    const [to, setTo] = useState('')
    const [debouncedTo] = useDebounce(to, 500)

    const [amount, setAmount] = useState('')
    const [debouncedAmount] = useDebounce(amount, 500)

    const request = usePrepareSendTransaction({
        to: debouncedTo,
        value: debouncedAmount ? utils.parseEther(debouncedAmount)._hex : undefined,
    })
    let error;
    if (request.error) {
        error = request.error
    }

    const { sendTransaction } = useSendTransaction(request.data)

    const StyledInput = styled.input`
  color: red;
`;


    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    sendTransaction?.()
                }}
            >
                <StyledInput
                    aria-label="Recipient"
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="0xA0Cf…251e"
                    value={to}
                />
                <StyledInput
                    aria-label="Amount (ether)"
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.05"
                    value={amount}
                />
                <button disabled={!sendTransaction || !to || !amount}>Send</button>
            </form>
            {error && (
                <div>An error occurred preparing the transaction: {error.message}</div>
            )}
        </>
    )
}
