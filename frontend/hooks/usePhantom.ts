import { useEffect, useState, useRef } from "react"

const usePhantom = () => {
    const [phantomProvider, setPhantomProvider] = useState<any>(null)

    useEffect(() => {
        // @ts-ignore
        if (typeof window.phantom?.solana !== 'undefined') {
            // @ts-ignore
            const provider = window.phantom?.solana

            if (provider?.isPhantom && !phantomProvider) {
                setPhantomProvider(provider)
            }
        }
    })

    return { phantomProvider }
}

export default usePhantom
