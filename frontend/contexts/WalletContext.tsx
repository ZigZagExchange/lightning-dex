import React, { createContext, useState } from "react"
import getLocalStorage from "../utils/getLocalStorage"

interface Props {
  children: React.ReactNode
}

export enum Chain {
  all = 'ALL',
  evm = 'EVM',
  solana = 'SOLANA',
}

export type CurrentAction = 'None' | 'Origin' | 'Destination' | 'Swap'

export type WalletContextType = {
  chain: Chain
  address: string
  balance: string
  orgChainId: number
  destChainId: number
  isConnected: boolean
  currentAction: CurrentAction

  updateChain: (_chain: Chain) => void
  updateAddress: (_address: string) => void
  updateBalance: (_balance: string) => void
  updateOrgChainId: (_chainId: number) => void
  updateDestChainId: (_chainId: number) => void
  updateIsConnected: (_isConnected: boolean) => void
  updateCurrentAction: (_action: CurrentAction) => void
}

export const WalletContext = createContext<WalletContextType>({
  chain: Chain.all,
  address: '',
  balance: '0.00 ETH',
  orgChainId: 1,
  destChainId: 42161,
  isConnected: false,
  currentAction: 'None',

  updateChain: (_chain: Chain) => { },
  updateAddress: (_address: string) => { },
  updateBalance: (_balance: string) => { },
  updateOrgChainId: (_chainId: number) => { },
  updateDestChainId: (_chainId: number) => { },
  updateIsConnected: (_isConnected: boolean) => { },
  updateCurrentAction: (_action: CurrentAction) => { },
})

function WalletProvider({ children }: Props) {
  const [chain, setChain] = useState<Chain>(Chain.evm)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('0.00 ETH')
  const [isConnected, setIsConnected] = useState(false)
  const [currentAction, setCurrentAction] = useState<CurrentAction>('Origin')
  const [orgChainId, setOrgChainId] = useState(getLocalStorage('orgChainId', 1))
  const [destChainId, setDestChainId] = useState(getLocalStorage('destChainId', 42161))

  const updateChain = (_chain: Chain) => {
    setChain(_chain)
  }

  const updateAddress = (_address: string) => {
    setAddress(_address)
  }

  const updateBalance = (_balance: string) => {
    setBalance(_balance)
  }

  const updateIsConnected = (_isConnected: boolean) => {
    setIsConnected(_isConnected)
  }

  const updateOrgChainId = (_chainId: number) => {
    setOrgChainId(_chainId)
  }

  const updateDestChainId = (_chainId: number) => {
    setDestChainId(_chainId)
  }

  const updateCurrentAction = (_action: CurrentAction) => {
    setCurrentAction(_action)
  }

  return (
    <WalletContext.Provider
      value={{
        chain,
        address,
        balance,
        orgChainId,
        destChainId,
        isConnected,
        currentAction,

        updateChain,
        updateAddress,
        updateBalance,
        updateOrgChainId,
        updateDestChainId,
        updateIsConnected,
        updateCurrentAction
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
