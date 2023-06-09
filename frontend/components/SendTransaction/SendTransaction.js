import { useState, useEffect } from "react";
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { utils } from 'ethers';
import { styled } from 'styled-components';
import { TransactionWizardModal } from "../bridge/modals/transactionWizardModal/TransactionWizardModal"

const StyledInput = styled.input`
  background-color: black;
`;

export function SendTransaction({address}) {
    const [isWizardOpen, setIsWizardOpen] = useState(false)

    const [amount, setAmount] = useState('');
    const [to, setTo] = useState('');
    const [debouncedAmount, setDebouncedAmount] = useState('');
    const [debouncedTo, setDebouncedTo] = useState('');

    const [isSent, setIsSent] = useState(false);
    const [isMined, setIsMined] = useState(false);
    const [bridgeSent, setBridgeSent] = useState('');

    const debounce = (func, delay) => {
        let timeoutId;

        return function (...args) {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    const debouncedAmountChange = debounce((value) => {
        setDebouncedAmount(value);
    }, 500);

    const debouncedToChange = debounce((value) => {
        setDebouncedTo(value);
    }, 500);

    const { config, error } = usePrepareContractWrite({
        address: '0x64Ca3FCa3B43c98F12A9E9509f9cF8AB18abc208',
        abi: [{ "inputs": [{ "internalType": "address", "name": "_beneficiary", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "initiator", "type": "address" }, { "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "out_chain", "type": "string" }, { "indexed": false, "internalType": "string", "name": "out_address", "type": "string" }], "name": "Deposit", "type": "event" }, { "inputs": [], "name": "beneficiary", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "string", "name": "out_chain", "type": "string" }, { "internalType": "string", "name": "out_address", "type": "string" }], "name": "depositERC20", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "out_chain", "type": "string" }, { "internalType": "string", "name": "out_address", "type": "string" }], "name": "depositETH", "outputs": [], "stateMutability": "payable", "type": "function" }],
        functionName: 'depositETH',
        args: ['BTC', debouncedTo ? debouncedTo : undefined],
        value: debouncedAmount ? utils.parseEther(debouncedAmount)._hex : undefined,
    });


    const { data, write } = useContractWrite(config);

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    async function pollAPI(address) {
        let intervalId = setInterval(() => {

            fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            })
                .then(r => r.json())
                .then(data => {
                    const latestTransaction = data.reduce((previous, current) => {
                        return new Date(current.deposit_timestamp) > new Date(previous.deposit_timestamp) ? current : previous;
                    });

                    if (latestTransaction.outgoing_txid) {
                        setBridgeSent(latestTransaction.outgoing_txid);
                        clearInterval(intervalId); // stop polling
                    }
                })
                .catch(error => console.error(error));
        }, 2000);
    }

    useEffect(() => {
        if (isLoading) {
            setIsSent(true)
        }
    }, [isLoading]);

    useEffect(() => {
        if (isSuccess) {
            setIsMined(data.hash || true)
            pollAPI(address)
        }
    }, [isSuccess]);

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setIsWizardOpen(!isWizardOpen);
                    write?.();
                }}
            >
                <StyledInput
                    aria-label="Amount (ether)"
                    onChange={(e) => {
                        setAmount(e.target.value);
                        debouncedAmountChange(e.target.value);
                    }}
                    placeholder="0.05"
                    value={amount}
                />
                <StyledInput
                    aria-label="BTC receiving address"
                    onChange={(e) => {
                        setTo(e.target.value);
                        debouncedToChange(e.target.value);
                    }}
                    placeholder="bc1qd...et62"
                    value={to}
                />
                <button disabled={!write || !to || !amount}>Send</button>
            </form>
            {error && (
                <div>An error occurred preparing the transaction: {error.message}</div>
            )}
            <TransactionWizardModal
                isSent={isSent}
                isMined={isMined}
                bridgeSent={bridgeSent}
                show={isWizardOpen}
                handleClose={() => setIsWizardOpen(false)}
            >
                <div style={{ color: "black" }}>
                    <h1>Transaction Wizard </h1>
                </div>

            </TransactionWizardModal>
        </>
    );
}
