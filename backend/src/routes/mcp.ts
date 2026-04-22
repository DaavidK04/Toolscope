import express from 'express'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const router = express.Router()

router.post('/connect', async (req, res) => {
  const { url } = req.body

  if (!url) {
    res.status(400).json({ error: 'URL fehlt' })
    return
  }

  try {
    const client = new Client({ name: 'toolscope', version: '1.0.0' })
    const transport = new StreamableHTTPClientTransport(new URL(url))
    await client.connect(transport)

    const { tools } = await client.listTools()
    await client.close()

    res.json({ tools })
  } catch (err) {
    res.status(500).json({ error: 'Verbindung fehlgeschlagen', detail: String(err) })
  }
})

router.post('/run', async (req, res) => {
  const { url, toolName, args } = req.body

  if (!url || !toolName) {
    res.status(400).json({ error: 'URL und toolName sind pflicht' })
    return
  }

  try {
    const client = new Client({ name: 'toolscope', version: '1.0.0' })
    const transport = new StreamableHTTPClientTransport(new URL(url))
    await client.connect(transport)

    const result = await client.callTool({
      name: toolName,
      arguments: args ?? {}
    })

    await client.close()

    res.json({ result })
  } catch (err) {
    res.status(500).json({ error: 'Tool-Aufruf fehlgeschlagen', detail: String(err) })
  }
})

export default router