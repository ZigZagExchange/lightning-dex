import { useState } from "react"
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { utils } from 'ethers'
import { styled } from 'styled-components'
import { useDebounce } from 'use-debounce'

export function SendTransaction() {

    // const response = usePrepareSendTransaction({
    //     to: 'moxey.eth',
    //     value: utils.parseEther('0.1'),
    // })
    // console.log(response.data)

    const request = usePrepareSendTransaction({
        to: 'moxey.eth',
        value: utils.parseEther('0.1'),
        maxFeePerGas: utils.parseEther('50') * 10 ** -9
    })

    const { sendTransaction } = useSendTransaction(request.data)
    console.log(request)


    return (
        <>
            <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
                Send Transaction
            </button>
            {/* {error && (
                <div>An error occurred preparing the transaction: {error.message}</div>
            )} */}
        </>
    )
}
