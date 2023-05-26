import { atom } from 'jotai'

const initial = {
    name: "USDC",
    base: "USD Circle",
    network: "Ethereum",
    bg: "#3b82f6",
    border: "#93c5fd",
    icon: "usdc.svg",
    networkIcon: "eth.svg"
}

export const originTokenAtom = atom(initial);
export const destTokenAtom = atom(initial);
