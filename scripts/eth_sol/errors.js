import fetch from 'node-fetch'

export async function reportError (label, error) {
  console.error(label, error)
  if (process.env.REPORTING_API_URL) {
    await fetch(process.env.REPORTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        label,
        stack_trace: JSON.stringify(error)
      })
    })
  }
}