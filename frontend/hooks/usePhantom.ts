import { useEffect, useState, useRef } from "react"

const usePhantom = () => {
    const [phantomProvider, setPhantomProvider] = useState<any>(null)

    useEffect(() => {
        console.log(window.phantom)
        // @ts-ignore
        if (typeof window.phantom?.solana !== 'undefined') {
            // @ts-ignore
            const provider = window.phantom?.solana

            if (provider?.isPhantom) {
                setPhantomProvider(provider)
            }
        }
    }, [])

    return { phantomProvider }
}

export default usePhantom
