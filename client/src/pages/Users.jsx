import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const roleOptions = ['super_admin', 'regional_officer', 'station_personnel', 'viewer']
const regionOptions = ['Bicol Region', 'NCR', 'Region IV-A', 'Region V', 'Region VI']
const stationOptions = ['HQ', 'Naga City Station', 'Legazpi City Station', 'Tabaco Station', 'Iriga City Station', 'Sorsogon City Station']

const roleStyle = {
  super_admin:        { label: 'Super Admin',        color: '#EA580C', bg: '#FFF1EB' },
  regional_officer:   { label: 'Regional Officer',   color: '#2563EB', bg: '#EFF6FF' },
  station_personnel:  { label: 'Station Personnel',  color: '#16A34A', bg: '#F0FDF4' },
  viewer:             { label: 'Viewer',              color: '#78716C', bg: '#F5F5F4' },
}

const formatDate = (dt) => new Date(dt).toLocaleDateString('en-PH', {
  month: 'short', day: 'numeric', year: 'numeric',
})

function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user?.id
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'viewer',
    region: user?.region || 'Bicol Region',
    station: user?.station || 'HQ',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name || !form.email) return setError('Full name and email are required')
    if (!isEdit && !form.password) return setError('Password is required')
    setLoading(true)
    try {
      if (isEdit) {
        const res = await api.put(`/api/users/${user.id}`, form)
        onSave(res.data.user)
      } else {
        const res = await api.post('/api/auth/register', form)
        onSave(res.data.user)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', fontSize: 13,
    color: '#1C1917', border: '0.5px solid #E7E3DF',
    borderRadius: 8, backgroundColor: '#FAFAF9',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: 11, fontWeight: 500,
    color: '#78716C', display: 'block', marginBottom: 5,
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 480,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '0.5px solid #F0EDE9',
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: '#1C1917', margin: 0 }}>
              {isEdit ? 'Edit user' : 'Add new user'}
            </h2>
            <p style={{ fontSize: 12, color: '#A8A29E', margin: '2px 0 0' }}>
              {isEdit ? 'Update user details and role' : 'Create a new account for a BFP personnel'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '0.5px solid #E7E3DF',
            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
            color: '#78716C', display: 'flex', alignItems: 'center',
          }}>
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: 20 }}>
          {error && (
            <div style={{
              fontSize: 12, padding: '10px 14px', borderRadius: 8, marginBottom: 14,
              backgroundColor: '#FEF2F2', border: '0.5px solid #FECACA', color: '#DC2626',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Full name</label>
              <input
                style={inputStyle}
                placeholder="e.g. Juan dela Cruz"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#EA580C'}
                onBlur={e => e.target.style.borderColor = '#E7E3DF'}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email"
                style={inputStyle}
                placeholder="you@bfp.gov.ph"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#EA580C'}
                onBlur={e => e.target.style.borderColor = '#E7E3DF'}
              />
            </div>
            {!isEdit && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  style={inputStyle}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#EA580C'}
                  onBlur={e => e.target.style.borderColor = '#E7E3DF'}
                />
              </div>
            )}
            <div>
              <label style={labelStyle}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                style={inputStyle}
              >
                {roleOptions.map(r => (
                  <option key={r} value={r}>
                    {roleStyle[r]?.label || r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Region</label>
              <select
                value={form.region}
                onChange={e => setForm({ ...form, region: e.target.value })}
                style={inputStyle}
              >
                {regionOptions.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Station</label>
              <select
                value={form.station}
                onChange={e => setForm({ ...form, station: e.target.value })}
                style={inputStyle}
              >
                {stationOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 20px', borderTop: '0.5px solid #F0EDE9',
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', fontSize: 13,
            border: '0.5px solid #E7E3DF', borderRadius: 8,
            backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-orange"
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 500,
              backgroundColor: '#EA580C', color: '#fff',
              border: 'none', borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}

export default function Users() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modal, setModal]       = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/users')
      setUsers(res.data.users)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (savedUser) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === savedUser.id)
      if (exists) return prev.map(u => u.id === savedUser.id ? savedUser : u)
      return [savedUser, ...prev]
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Users</h1>
          <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
            Manage BFP system user accounts and roles
          </p>
        </div>
        <button
          onClick={() => setModal({})}
          className="btn-orange"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: '#EA580C', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <PlusIcon style={{ width: 15, height: 15 }} />
          Add User
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total users', value: users.length, color: '#EA580C' },
          { label: 'Admins', value: users.filter(u => u.role === 'super_admin').length, color: '#DC2626' },
          { label: 'Officers', value: users.filter(u => u.role === 'regional_officer').length, color: '#2563EB' },
          { label: 'Personnel', value: users.filter(u => u.role === 'station_personnel').length, color: '#16A34A' },
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

      {/* Search + role filter */}
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
            placeholder="Search by name or email..."
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
        {['all', ...roleOptions].map(r => (
          <button key={r}
            onClick={() => setRoleFilter(r)}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 500,
              borderRadius: 8, cursor: 'pointer',
              border: roleFilter === r ? 'none' : '0.5px solid #E7E3DF',
              backgroundColor: roleFilter === r ? '#EA580C' : '#fff',
              color: roleFilter === r ? '#fff' : '#78716C',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {r === 'all' ? 'All' : roleStyle[r]?.label || r}
          </button>
        ))}
      </div>

      {/* Users table */}
      <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 100px',
          padding: '10px 16px', borderBottom: '0.5px solid #F0EDE9',
          backgroundColor: '#FAFAF9',
        }}>
          {['User', 'Role', 'Region', 'Station', 'Joined', 'Actions'].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 500,
              color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.4px',
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: '#A8A29E' }}>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              backgroundColor: '#FFF1EB', border: '0.5px solid #FCD9C4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <UserCircleIcon style={{ width: 26, height: 26, color: '#EA580C' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1917', margin: '0 0 4px' }}>
              {users.length === 0 ? 'No users found' : 'No users match your search'}
            </p>
            <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>
              {users.length === 0 ? 'Add your first user to get started' : 'Try a different search term'}
            </p>
          </div>
        ) : (
          <>
            {filtered.map((user, i) => {
              const rs = roleStyle[user.role] || { label: user.role, color: '#78716C', bg: '#F5F5F4' }
              return (
                <div key={user.id} className="row-hover" style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 100px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                }}>
                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      backgroundColor: '#FFF1EB', border: '0.5px solid #FCD9C4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 500, color: '#EA580C', flexShrink: 0,
                    }}>
                      {initials(user.full_name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>
                        {user.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 1 }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Role badge */}
                  <span className="badge-pop" style={{
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 10px', borderRadius: 20,
                    backgroundColor: rs.bg, color: rs.color,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    width: 'fit-content',
                  }}>
                    <ShieldCheckIcon style={{ width: 11, height: 11 }} />
                    {rs.label}
                  </span>

                  <span style={{ fontSize: 12, color: '#57534E' }}>{user.region || '—'}</span>
                  <span style={{ fontSize: 12, color: '#57534E' }}>{user.station || '—'}</span>
                  <span style={{ fontSize: 12, color: '#A8A29E' }}>{formatDate(user.created_at)}</span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setModal(user)}
                      title="Edit"
                      style={{
                        background: 'none', border: '0.5px solid #E7E3DF',
                        borderRadius: 6, padding: '4px 6px',
                        cursor: 'pointer', color: '#78716C',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <PencilSquareIcon style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={deleting === user.id}
                      title="Delete"
                      style={{
                        background: 'none', border: '0.5px solid #FCD9C4',
                        borderRadius: 6, padding: '4px 6px',
                        cursor: deleting === user.id ? 'not-allowed' : 'pointer',
                        color: '#EA580C', opacity: deleting === user.id ? 0.5 : 1,
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <TrashIcon style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Footer */}
            <div style={{
              padding: '12px 16px', borderTop: '0.5px solid #F0EDE9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: '#A8A29E' }}>
                Showing {filtered.length} of {users.length} users
              </span>
            </div>
          </>
        )}
      </div>

      {/* User modal */}
      {modal !== null && (
        <UserModal
          user={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </Layout>
  )
}