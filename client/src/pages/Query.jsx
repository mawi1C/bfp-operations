import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import {
  PaperAirplaneIcon,
  FireIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const suggestions = [
  'How many fire incidents in Naga City last month?',
  'Show all arson cases in Bicol Region 2026',
  'Total estimated damage in Q1 2026',
  'Top 5 causes of fire this year',
  'Average response time per station',
  'Compare incidents in January vs February',
  'Show incidents with fatalities this year',
  'Which city had the most fires last month?',
]

const ruleEngine = (input) => {
  const q = input.toLowerCase()

  if ((q.includes('how many') || q.includes('count')) && q.includes('naga')) {
    return {
      type: 'count',
      text: 'Found 28 fire incidents in Naga City for the queried period.',
      table: {
        headers: ['Barangay', 'Cause', 'Date', 'Status'],
        rows: [
          ['Triangulo', 'Electrical fault', 'Jun 24, 2026', 'Closed'],
          ['Bagumbayan', 'Arson', 'Jun 7, 2026', 'Investigating'],
          ['Dayangdang', 'LPG leak', 'Jun 12, 2026', 'Open'],
        ],
        more: 25,
      },
      source: 'naga_june2026_report.xlsx',
    }
  }

  if (q.includes('arson')) {
    return {
      type: 'filter',
      text: 'Found 9 arson cases in Bicol Region for 2026.',
      table: {
        headers: ['Location', 'Fatalities', 'Damage', 'Status'],
        rows: [
          ['Tabaco City, Albay', '2', '₱1.2M', 'Investigating'],
          ['Legazpi City, Albay', '1', '₱850K', 'Investigating'],
          ['Naga City, CamSur', '0', '₱320K', 'Closed'],
        ],
        more: 6,
      },
      source: 'bicol_incidents_2026.pdf',
    }
  }

  if (q.includes('total') && (q.includes('damage') || q.includes('cost'))) {
    return {
      type: 'aggregate',
      text: 'Total estimated damage for the queried period:',
      summary: [
        { label: 'Total damage', value: '₱48.2M' },
        { label: 'Highest single incident', value: '₱3.5M' },
        { label: 'Average per incident', value: '₱38,620' },
        { label: 'Incidents counted', value: '1,248' },
      ],
      source: 'bicol_q1_2026_summary.xlsx',
    }
  }

  if (q.includes('top') && q.includes('cause')) {
    return {
      type: 'rank',
      text: 'Top causes of fire in Bicol Region for 2026:',
      table: {
        headers: ['Rank', 'Cause', 'Count', 'Percentage'],
        rows: [
          ['1', 'Electrical fault', '412', '33%'],
          ['2', 'Open flame', '298', '24%'],
          ['3', 'Arson', '187', '15%'],
          ['4', 'LPG leak', '154', '12%'],
          ['5', 'Undetermined', '197', '16%'],
        ],
        more: 0,
      },
      source: 'bicol_annual_2026.pdf',
    }
  }

  if (q.includes('average') && q.includes('response')) {
    return {
      type: 'aggregate',
      text: 'Average response time per fire station:',
      summary: [
        { label: 'Naga City Station', value: '5.2 min' },
        { label: 'Legazpi City Station', value: '6.8 min' },
        { label: 'Tabaco Station', value: '7.1 min' },
        { label: 'Overall average', value: '6.4 min' },
      ],
      source: 'response_time_report_2026.xlsx',
    }
  }

  if (q.includes('compare')) {
    return {
      type: 'compare',
      text: 'Comparison of fire incidents:',
      table: {
        headers: ['Metric', 'January', 'February'],
        rows: [
          ['Total incidents', '182', '145'],
          ['Fatalities', '4', '2'],
          ['Injuries', '18', '11'],
          ['Damage (PHP)', '₱12.4M', '₱8.7M'],
          ['Avg response time', '6.2 min', '6.5 min'],
        ],
        more: 0,
      },
      source: 'bicol_q1_2026_summary.xlsx',
    }
  }

  return {
    type: 'notfound',
    text: `No records found matching your query. Try rephrasing or use a keyword like a location, cause, or date.`,
    suggestions: suggestions.slice(0, 3),
  }
}

const statusColors = {
  Closed: { color: '#D97706', bg: '#FFFBEB' },
  Investigating: { color: '#DC2626', bg: '#FEF2F2' },
  Open: { color: '#2563EB', bg: '#EFF6FF' },
}

export default function Query() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'system',
      text: 'Hello! Ask me anything about fire incident records. You can search by location, date, cause, or request statistics and comparisons.',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text) => {
    const query = text || input.trim()
    if (!query) return

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: query }])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const result = ruleEngine(query)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', result, text: result.text }])
      setLoading(false)
    }, 800)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Query / Chat</h1>
          <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
            Ask anything about fire incident records in natural language
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

          {/* Chat area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '4px 0 16px',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  {msg.role === 'user' ? (
                    <div style={{
                      backgroundColor: '#EA580C', color: '#fff',
                      padding: '10px 14px', borderRadius: '16px 16px 4px 16px',
                      fontSize: 13, maxWidth: '70%', lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </div>
                  ) : (
                    <div style={{ maxWidth: '85%' }}>
                      {/* System bubble */}
                      <div style={{
                        backgroundColor: '#fff',
                        border: '0.5px solid #F0EDE9',
                        borderRadius: '4px 16px 16px 16px',
                        padding: '12px 16px',
                        fontSize: 13, color: '#1C1917', lineHeight: 1.6,
                      }}>
                        <p style={{ margin: '0 0 10px', fontWeight: 500 }}>{msg.text}</p>

                        {/* Table result */}
                        {msg.result?.table && (
                          <div style={{ overflowX: 'auto', marginBottom: 8 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr style={{ backgroundColor: '#FAFAF9' }}>
                                  {msg.result.table.headers.map(h => (
                                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#A8A29E', fontWeight: 500, borderBottom: '0.5px solid #F0EDE9', whiteSpace: 'nowrap' }}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {msg.result.table.rows.map((row, i) => (
                                  <tr key={i} className="row-hover">
                                    {row.map((cell, j) => (
                                      <td key={j} style={{ padding: '7px 10px', color: '#57534E', borderBottom: '0.5px solid #F5F5F4' }}>
                                        {j === msg.result.table.headers.length - 1 && statusColors[cell] ? (
                                          <span style={{
                                            fontSize: 11, fontWeight: 500,
                                            padding: '2px 8px', borderRadius: 20,
                                            backgroundColor: statusColors[cell].bg,
                                            color: statusColors[cell].color,
                                          }}>
                                            {cell}
                                          </span>
                                        ) : cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                {msg.result.table.more > 0 && (
                                  <tr>
                                    <td colSpan={msg.result.table.headers.length} style={{ padding: '6px 10px', color: '#A8A29E', fontStyle: 'italic', fontSize: 11, textAlign: 'center' }}>
                                      +{msg.result.table.more} more records
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Summary result */}
                        {msg.result?.summary && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                            {msg.result.summary.map(item => (
                              <div key={item.label} style={{
                                backgroundColor: '#FFF8F4',
                                border: '0.5px solid #F0D5C8',
                                borderRadius: 8, padding: '8px 12px',
                              }}>
                                <div style={{ fontSize: 11, color: '#A8A29E', marginBottom: 2 }}>{item.label}</div>
                                <div style={{ fontSize: 15, fontWeight: 500, color: '#EA580C' }}>{item.value}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Not found suggestions */}
                        {msg.result?.suggestions && (
                          <div style={{ marginTop: 8 }}>
                            <p style={{ fontSize: 11, color: '#A8A29E', margin: '0 0 6px' }}>Try these instead:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {msg.result.suggestions.map(s => (
                                <button key={s} onClick={() => handleSend(s)} style={{
                                  textAlign: 'left', fontSize: 12,
                                  color: '#EA580C', background: '#FFF1EB',
                                  border: '0.5px solid #FCD9C4',
                                  borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                                }}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Source */}
                        {msg.result?.source && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                            <DocumentTextIcon style={{ width: 12, height: 12, color: '#C4BFB9' }} />
                            <span style={{ fontSize: 11, color: '#C4BFB9' }}>Source: {msg.result.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading bubble */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
                    borderRadius: '4px 16px 16px 16px',
                    padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: '#F0D5C8',
                        animation: `bounce 1s ease ${i * 0.15}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, flexShrink: 0 }}>
              {suggestions.slice(0, 4).map(s => (
                <button key={s} onClick={() => handleSend(s)} style={{
                  fontSize: 11, padding: '5px 10px',
                  border: '0.5px solid #E7E3DF', borderRadius: 20,
                  backgroundColor: '#fff', color: '#78716C',
                  cursor: 'pointer', transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              backgroundColor: '#fff',
              border: '0.5px solid #F0EDE9',
              borderRadius: 12, padding: '8px 12px',
              flexShrink: 0,
            }}>
              <MagnifyingGlassIcon style={{ width: 16, height: 16, color: '#C4BFB9', flexShrink: 0 }} />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about fire incidents… e.g. 'Total casualties in Albay Q1'"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 13, color: '#1C1917',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  width: 32, height: 32,
                  backgroundColor: input.trim() ? '#EA580C' : '#F0EDE9',
                  border: 'none', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'default',
                  transition: 'background 0.2s ease', flexShrink: 0,
                }}
              >
                <PaperAirplaneIcon style={{ width: 15, height: 15, color: input.trim() ? '#fff' : '#C4BFB9' }} />
              </button>
            </div>
          </div>

          {/* Right panel — query guide */}
          <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <SparklesIcon style={{ width: 14, height: 14, color: '#EA580C' }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1C1917' }}>Query types</span>
              </div>
              {[
                { icon: ChartBarIcon, label: 'Count', example: '"How many fires in Naga?"' },
                { icon: MagnifyingGlassIcon, label: 'Filter', example: '"Show arson cases"' },
                { icon: FireIcon, label: 'Aggregate', example: '"Total damage in Q1"' },
                { icon: ChartBarIcon, label: 'Rank', example: '"Top 5 causes"' },
                { icon: DocumentTextIcon, label: 'Compare', example: '"Jan vs Feb incidents"' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <item.icon style={{ width: 13, height: 13, color: '#EA580C' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#57534E' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#A8A29E', paddingLeft: 19 }}>{item.example}</span>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#FFF8F4', border: '0.5px solid #F0D5C8', borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#EA580C', margin: '0 0 6px' }}>💡 Tip</p>
              <p style={{ fontSize: 11, color: '#78716C', margin: 0, lineHeight: 1.6 }}>
                You can use natural language. Try keywords like city names, causes, dates, or metrics like "damage" or "casualties".
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </Layout>
  )
}