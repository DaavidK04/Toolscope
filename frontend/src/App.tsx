import { useState } from 'react'
import { connectToServer, runTool } from './api'

type Tool = {
  name: string
  description: string
  inputSchema: {
    properties?: Record<string, { type: string; description?: string }>
    required?: string[]
  }
}

export default function App() {
  const [url, setUrl] = useState('')
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [args, setArgs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  async function handleConnect() {
    setLoading(true)
    setError('')
    setTools([])
    setSelectedTool(null)
    setResult(null)
    try {
      const tools = await connectToServer(url)
      setTools(tools)
    } catch {
      setError('Verbindung fehlgeschlagen. Ist die URL korrekt?')
    } finally {
      setLoading(false)
    }
  }

  async function handleRun() {
    if (!selectedTool) return
    setRunning(true)
    setResult(null)
    try {
      const res = await runTool(url, selectedTool.name, args)
      const text = res?.content?.[0]?.text ?? JSON.stringify(res, null, 2)
      setResult(text)
    } catch {
      setResult('Fehler beim Ausführen des Tools.')
    } finally {
      setRunning(false)
    }
  }

  function selectTool(tool: Tool) {
    setSelectedTool(tool)
    setArgs({})
    setResult(null)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🔭 Toolscope</h1>
      <p style={{ color: '#666' }}>Explore and test MCP servers</p>

      {/* Connect */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem', borderRadius: 6, border: '1px solid #ccc' }}
          placeholder="MCP Server URL z.B. https://mcp.deepwiki.com/mcp"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConnect()}
        />
        <button
          onClick={handleConnect}
          disabled={loading || !url}
          style={{ padding: '0.5rem 1rem', borderRadius: 6, background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Verbinde...' : 'Connect'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Tool List */}
      {tools.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>Tools ({tools.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {tools.map(tool => (
              <div
                key={tool.name}
                onClick={() => selectTool(tool)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: `2px solid ${selectedTool?.name === tool.name ? '#2563eb' : '#e5e7eb'}`,
                  cursor: 'pointer',
                  background: selectedTool?.name === tool.name ? '#eff6ff' : 'white'
                }}
              >
                <strong>{tool.name}</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '0.9rem' }}>{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Runner */}
      {selectedTool && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
          <h3>▶ {selectedTool.name}</h3>
          {Object.entries(selectedTool.inputSchema.properties ?? {}).map(([key, schema]) => (
            <div key={key} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
                {key} {selectedTool.inputSchema.required?.includes(key) && <span style={{ color: 'red' }}>*</span>}
              </label>
              <input
                style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box' }}
                placeholder={schema.description ?? schema.type}
                value={args[key] ?? ''}
                onChange={e => setArgs(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <button
            onClick={handleRun}
            disabled={running}
            style={{ padding: '0.5rem 1.5rem', borderRadius: 6, background: '#16a34a', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            {running ? 'Läuft...' : 'Run Tool'}
          </button>

          {result && (
            <pre style={{ marginTop: '1rem', background: '#f3f4f6', padding: '1rem', borderRadius: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}