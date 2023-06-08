// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type item = {
  completed: boolean,
  name: string
}

type Data = Array<item>

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json([
    { completed: true, name: "Approve" },
    { completed: true, name: "Send" },
    { completed: true, name: "Tx Mined" },
    { completed: false, name: "Bridge Sent" },
    { completed: false, name: "Received" }
  ])
}
