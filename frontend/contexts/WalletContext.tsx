import React, { createContext, useState } from "react"
import getLocalStorage from "../utils/getLocalStorage"

interface Props {
  children: React.ReactNode
}

export enum Chain {
  all = 'ALL',
  evm = 'EVM',
  solana = 'SOLANA',
  btc = 'BTC',
}

export type CurrentAction = 'None' | 'Origin' | 'Destination' | 'Swap'

export type Connected = 'MataMask' | 'Phantom' | null

export type WalletContextType = {
  chain: Chain
  address: string
  balance: string
  orgChainId: number
  destChainId: number
  isLoading: boolean
  isConnected: Connected
  currentAction: CurrentAction

  updateChain: (_chain: Chain) => void
  updateAddress: (_address: string) => void
  updateBalance: (_balance: string) => void
  updateOrgChainId: (_chainId: number) => void
  updateDestChainId: (_chainId: number) => void
  updateIsLoading: (_loading: boolean) => void
  updateIsConnected: (_isConnected: Connected) => void
  updateCurrentAction: (_action: CurrentAction) => void
}

export const WalletContext = createContext<WalletContextType>({
  chain: Chain.all,
  address: '',
  balance: '0.00 ETH',
  orgChainId: 1,
  destChainId: 42161,
  isLoading: false,
  isConnected: null,
  currentAction: 'None',

  updateChain: (_chain: Chain) => { },
  updateAddress: (_address: string) => { },
  updateBalance: (_balance: string) => { },
  updateOrgChainId: (_chainId: number) => { },
  updateDestChainId: (_chainId: number) => { },
  updateIsLoading: (_loading: boolean) => { },
  updateIsConnected: (_isConnected: Connected) => { },
  updateCurrentAction: (_action: CurrentAction) => { },
})

function WalletProvider({ children }: Props) {
  const [chain, setChain] = useState<Chain>(getLocalStorage('chain', Chain.evm))
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState('0.00 ETH')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState<Connected>(null)
  const [currentAction, setCurrentAction] = useState<CurrentAction>('Origin')
  const [orgChainId, setOrgChainId] = useState(Number(getLocalStorage('orgChainId', 1)))
  const [destChainId, setDestChainId] = useState(Number(getLocalStorage('destChainId', 42161)))

  const updateChain = (_chain: Chain) => {
    localStorage.setItem('chain', _chain)
    setChain(_chain)
  }

  const updateAddress = (_address: string) => {
    setAddress(_address)
  }

  const updateBalance = (_balance: string) => {
    setBalance(_balance)
  }

  const updateIsLoading = (_loading: boolean) => {
    setIsLoading(_loading)
  }

  const updateIsConnected = (_isConnected: Connected) => {
    setIsConnected(_isConnected)
  }

  const updateOrgChainId = (_chainId: number) => {
    setOrgChainId(_chainId)
    localStorage.setItem('orgChainId', _chainId.toString())
  }

  const updateDestChainId = (_chainId: number) => {
    setDestChainId(_chainId)
    localStorage.setItem('destChainId', _chainId.toString())
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
        isLoading,
        isConnected,
        currentAction,

        updateChain,
        updateAddress,
        updateBalance,
        updateOrgChainId,
        updateDestChainId,
        updateIsLoading,
        updateIsConnected,
        updateCurrentAction
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
