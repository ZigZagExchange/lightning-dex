export default async function handler(req, res) {
    const { ethAddress } = req.body // Extract the 'address' property from the request body

    try {
        console.log(`https://api.zap.zigzag.exchange/btc_deposit?deposit_currency=BTC&outgoing_currency=ETH&outgoing_address=${ethAddress}`)
        const response = await fetch(`https://api.zap.zigzag.exchange/btc_deposit?deposit_currency=BTC&outgoing_currency=ETH&outgoing_address=${ethAddress}`)
        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
