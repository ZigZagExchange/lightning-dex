export default async function handler(req, res) {
    try {
        const response = await fetch(`https://mempool.space/api/blocks/tip/height`)
        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
}