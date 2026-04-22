import axios from 'axios'

const BASE = 'http://localhost:3000/api'

export async function connectToServer(url: string) {
  const res = await axios.post(`${BASE}/connect`, { url })
  return res.data.tools
}

export async function runTool(url: string, toolName: string, args: Record<string, unknown>) {
  const res = await axios.post(`${BASE}/run`, { url, toolName, args })
  return res.data.result
}