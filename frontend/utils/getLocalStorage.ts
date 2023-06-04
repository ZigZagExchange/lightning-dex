import type { Chain } from "../contexts/WalletContext"

const getLocalStorage = (key: string, value: any) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
        ? localStorage.getItem(key)
        : value
    } else {
      return value
    }
}

export default getLocalStorage