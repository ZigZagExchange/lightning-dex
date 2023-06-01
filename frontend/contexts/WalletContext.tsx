import React, { createContext, useState } from "react"

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
  orgChainId: number
  destChainId: number
  currentAction: CurrentAction,

  updateChain: (_chain: Chain) => void
  updateOrgChainId: (_chainId: number) => void
  updateDestChainId: (_chainId: number) => void
  updateCurrentAction: (_action: CurrentAction) => void
}

export const WalletContext = createContext<WalletContextType>({
  chain: Chain.all,
  orgChainId: 1,
  destChainId: 42161,
  currentAction: 'None',

  updateChain: (_chain: Chain) => { },
  updateOrgChainId: (_chainId: number) => { },
  updateDestChainId: (_chainId: number) => { },
  updateCurrentAction: (_action: CurrentAction) => { }
})

function WalletProvider({ children }: Props) {
  const [chain, setChain] = useState<Chain>(Chain.evm)
  const [orgChainId, setOrgChainId] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('orgChainId')
        ? Number(localStorage.getItem('orgChainId'))
        : 1
    } else {
      return 1
    }
  })
  const [destChainId, setDestChainId] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('destChainId')
        ? Number(localStorage.getItem('destChainId'))
        : 42161
    } else {
      return 42161
    }
  })
  const [currentAction, setCurrentAction] = useState<CurrentAction>('Origin')

  const updateChain = (_chain: Chain) => {
    setChain(_chain)
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
        orgChainId,
        destChainId,
        currentAction,

        updateChain,
        updateOrgChainId,
        updateDestChainId,
        updateCurrentAction
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
