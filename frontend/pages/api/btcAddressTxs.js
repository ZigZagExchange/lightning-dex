export default async function handler(req, res) {
    const { btcDepositAddress } = req.body // Extract the 'address' property from the request body

    try {
        const response = await fetch(`https://mempool.space/api/address/${btcDepositAddress}/txs`)
        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
