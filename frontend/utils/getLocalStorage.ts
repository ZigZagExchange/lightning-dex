const getLocalStorage = (key: string, value: number) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
        ? Number(localStorage.getItem(key))
        : value
    } else {
      return value
    }
}

export default getLocalStorage