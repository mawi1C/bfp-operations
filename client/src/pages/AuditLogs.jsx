import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const actionStyle = {
  FILE_UPLOAD:    { color: '#16A34A', bg: '#F0FDF4' },
  FILE_DELETE:    { color: '#DC2626', bg: '#FEF2F2' },
  USER_LOGIN:     { color: '#2563EB', bg: '#EFF6FF' },
  USER_LOGOUT:    { color: '#78716C', bg: '#F5F5F4' },
  INCIDENT_ADD:   { color: '#EA580C', bg: '#FFF1EB' },
  INCIDENT_EDIT:  { color: '#D97706', bg: '#FFFBEB' },
  INCIDENT_DELETE:{ color: '#DC2626', bg: '#FEF2F2' },
  USER_CREATE:    { color: '#7C3AED', bg: '#F5F3FF' },
  USER_DELETE:    { color: '#DC2626', bg: '#FEF2F2' },
}

const formatDate = (dt) => new Date(dt).toLocaleDateString('en-PH', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

export default function AuditLogs() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/users/audit-logs')
      setLogs(res.data.logs)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const uniqueActions = [...new Set(logs.map(l => l.action))]

  const filtered = logs.filter(log => {
    const matchSearch = !search ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.target_table?.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'all' || log.action === actionFilter
    return matchSearch && matchAction
  })

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Audit Logs</h1>
          <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
            Track all user actions and system events
          </p>
        </div>
        <button
          onClick={fetchLogs}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', fontSize: 12, fontWeight: 500,
            border: '0.5px solid #E7E3DF', borderRadius: 8,
            backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
          }}
        >
          <ArrowPathIcon style={{ width: 14, height: 14 }} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total events', value: logs.length, color: '#EA580C' },
          { label: 'File uploads', value: logs.filter(l => l.action === 'FILE_UPLOAD').length, color: '#16A34A' },
          { label: 'Logins', value: logs.filter(l => l.action === 'USER_LOGIN').length, color: '#2563EB' },
          { label: 'Today', value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, color: '#D97706' },
        ].map(card => (
          <div key={card.label} className="stat-card" style={{
            backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ fontSize: 12, color: '#A8A29E', marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{
        backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', gap: 10, alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <MagnifyingGlassIcon style={{
            width: 15, height: 15, color: '#C4BFB9',
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          }} />
          <input
            type="text"
            placeholder="Search by action, user, or table..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px 8px 32px',
              fontSize: 13, color: '#1C1917',
              border: '0.5px solid #E7E3DF', borderRadius: 8,
              backgroundColor: '#FAFAF9', outline: 'none',
            }}
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{
            padding: '8px 12px', fontSize: 12,
            border: '0.5px solid #E7E3DF', borderRadius: 8,
            backgroundColor: '#fff', color: '#78716C', outline: 'none',
          }}
        >
          <option value="all">All actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Logs table */}
      <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '160px 1fr 120px 120px 160px',
          padding: '10px 16px', borderBottom: '0.5px solid #F0EDE9',
          backgroundColor: '#FAFAF9',
        }}>
          {['Action', 'Details', 'User', 'Table', 'Date & Time'].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 500,
              color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.4px',
            }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: '#A8A29E' }}>
            Loading logs...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              backgroundColor: '#FFF1EB', border: '0.5px solid #FCD9C4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <ClipboardDocumentListIcon style={{ width: 26, height: 26, color: '#EA580C' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1917', margin: '0 0 4px' }}>
              No logs found
            </p>
            <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>
              System events will appear here as users interact with the system
            </p>
          </div>
        ) : (
          <>
            {filtered.map((log, i) => {
              const as = actionStyle[log.action] || { color: '#78716C', bg: '#F5F5F4' }
              return (
                <div key={log.id} className="row-hover" style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 120px 120px 160px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                }}>
                  <span className="badge-pop" style={{
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 10px', borderRadius: 20,
                    backgroundColor: as.bg, color: as.color,
                    display: 'inline-block', width: 'fit-content',
                  }}>
                    {log.action}
                  </span>
                  <div style={{ fontSize: 12, color: '#57534E', paddingRight: 16 }}>
                    {log.metadata?.filename && (
                      <span>File: <strong>{log.metadata.filename}</strong></span>
                    )}
                    {!log.metadata?.filename && log.target_id && (
                      <span style={{ color: '#A8A29E', fontSize: 11 }}>ID: {log.target_id}</span>
                    )}
                    {!log.metadata?.filename && !log.target_id && (
                      <span style={{ color: '#A8A29E' }}>—</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#57534E' }}>
                    {log.users?.full_name || '—'}
                  </span>
                  <span style={{ fontSize: 12, color: '#A8A29E', textTransform: 'capitalize' }}>
                    {log.target_table || '—'}
                  </span>
                  <span style={{ fontSize: 12, color: '#A8A29E' }}>
                    {formatDate(log.created_at)}
                  </span>
                </div>
              )
            })}

            <div style={{
              padding: '12px 16px', borderTop: '0.5px solid #F0EDE9',
              fontSize: 12, color: '#A8A29E',
            }}>
              Showing {filtered.length} of {logs.length} events
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}