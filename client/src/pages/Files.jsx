import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const getFileIcon = (type) => {
  if (type === 'pdf') return { icon: DocumentTextIcon, color: '#DC2626', bg: '#FEF2F2' }
  if (type === 'excel' || type === 'csv') return { icon: TableCellsIcon, color: '#16A34A', bg: '#F0FDF4' }
  if (type === 'docx') return { icon: DocumentIcon, color: '#2563EB', bg: '#EFF6FF' }
  return { icon: DocumentIcon, color: '#78716C', bg: '#F5F5F4' }
}

const formatDate = (dt) => new Date(dt).toLocaleDateString('en-PH', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

const formatSize = (mb) => {
  if (!mb) return '0 KB'
  return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
}

const statusStyle = {
  processed: { label: 'Processed', color: '#16A34A', bg: '#F0FDF4' },
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FFFBEB' },
  failed:    { label: 'Failed',    color: '#DC2626', bg: '#FEF2F2' },
}

const getPreviewUrl = (url, type) => {
  if (type === 'pdf') return url
  if (['excel', 'docx', 'csv'].includes(type)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }
  return url
}

function FilePreviewModal({ file, onClose }) {
  if (!file) return null
  const previewUrl = getPreviewUrl(file.cloudinary_url, file.file_type)
  const { icon: Icon, color, bg } = getFileIcon(file.file_type)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#fff', borderRadius: 16,
          width: '90%', maxWidth: 900, height: '85vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '0.5px solid #F0EDE9',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              backgroundColor: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon style={{ width: 17, height: 17, color }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>
                {file.original_filename}
              </div>
              <div style={{ fontSize: 11, color: '#A8A29E' }}>
                {formatSize(file.file_size_mb)} · {file.file_type?.toUpperCase()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => window.open(file.cloudinary_url, '_blank')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 500,
                padding: '6px 14px',
                border: '0.5px solid #E7E3DF', borderRadius: 8,
                backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
              }}
            >
              <ArrowDownTrayIcon style={{ width: 14, height: 14 }} />
              Download
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '0.5px solid #E7E3DF',
                borderRadius: 8, padding: '6px 8px',
                cursor: 'pointer', color: '#78716C',
                display: 'flex', alignItems: 'center',
              }}
            >
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F5F5F4', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: '#A8A29E',
            zIndex: 0,
          }}>
            Loading preview...
          </div>
          <iframe
            src={previewUrl}
            title={file.original_filename}
            style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 1 }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  )
}

export default function Files() {
  const [files, setFiles]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [deleting, setDeleting]   = useState(null)
  const [previewFile, setPreviewFile] = useState(null)

  useEffect(() => { fetchFiles() }, [])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/files')
      setFiles(res.data.files)
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/files/${id}`)
      setFiles(prev => prev.filter(f => f.id !== id))
    } catch {
      alert('Failed to delete file')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = files.filter(f => {
    const matchSearch = !search ||
      f.original_filename.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || f.file_type === typeFilter
    return matchSearch && matchType
  })

  const totalSize = files.reduce((a, b) => a + (b.file_size_mb || 0), 0)

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Files</h1>
        <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
          All uploaded incident report files
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total files',  value: files.length, color: '#EA580C' },
          { label: 'PDF files',   value: files.filter(f => f.file_type === 'pdf').length, color: '#DC2626' },
          { label: 'Excel / CSV', value: files.filter(f => ['excel','csv'].includes(f.file_type)).length, color: '#16A34A' },
          { label: 'Total size',  value: formatSize(totalSize), color: '#2563EB' },
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

      {/* Search + filter bar */}
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
            placeholder="Search files by name..."
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
        {['all', 'pdf', 'excel', 'csv', 'docx'].map(t => (
          <button key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 500,
              borderRadius: 8, cursor: 'pointer',
              border: typeFilter === t ? 'none' : '0.5px solid #E7E3DF',
              backgroundColor: typeFilter === t ? '#EA580C' : '#fff',
              color: typeFilter === t ? '#fff' : '#78716C',
              transition: 'all 0.15s ease',
              textTransform: 'uppercase',
            }}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {/* File list */}
      <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, overflow: 'hidden' }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 100px 100px 130px 150px 120px',
          padding: '10px 16px',
          borderBottom: '0.5px solid #F0EDE9',
          backgroundColor: '#FAFAF9',
        }}>
          {['File name', 'Type', 'Size', 'Uploaded by', 'Date uploaded', 'Actions'].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 500,
              color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '0.4px',
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#A8A29E' }}>Loading files...</div>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              backgroundColor: '#FFF1EB', border: '0.5px solid #FCD9C4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <FolderOpenIcon style={{ width: 26, height: 26, color: '#EA580C' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#1C1917', margin: '0 0 4px' }}>
              {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
            </p>
            <p style={{ fontSize: 13, color: '#A8A29E', margin: 0 }}>
              {files.length === 0 ? 'Upload incident reports to get started' : 'Try a different search term'}
            </p>
          </div>

        ) : (
          <>
            {filtered.map((file, i) => {
              const { icon: Icon, color, bg } = getFileIcon(file.file_type)
              const st = statusStyle[file.status] || statusStyle.processed
              return (
                <div key={file.id} className="row-hover" style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 100px 100px 130px 150px 120px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '0.5px solid #F5F5F4' : 'none',
                }}>

                  {/* File name + status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      backgroundColor: bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 18, height: 18, color }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: '#1C1917',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {file.original_filename}
                      </div>
                      <span className="badge-pop" style={{
                        fontSize: 10, fontWeight: 500,
                        padding: '1px 8px', borderRadius: 20,
                        backgroundColor: st.bg, color: st.color,
                        display: 'inline-block', marginTop: 2,
                      }}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Type */}
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.3px', color,
                  }}>
                    {file.file_type}
                  </span>

                  {/* Size */}
                  <span style={{ fontSize: 12, color: '#78716C' }}>
                    {formatSize(file.file_size_mb)}
                  </span>

                  {/* Uploaded by */}
                  <span style={{ fontSize: 12, color: '#78716C' }}>
                    {file.users?.full_name || 'Unknown'}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: 12, color: '#A8A29E' }}>
                    {formatDate(file.uploaded_at)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      title="Preview"
                      onClick={() => setPreviewFile(file)}
                      style={{
                        background: 'none', border: '0.5px solid #E7E3DF',
                        borderRadius: 6, padding: '4px 6px',
                        cursor: 'pointer', color: '#78716C',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <EyeIcon style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      title="Download"
                      onClick={() => window.open(file.cloudinary_url, '_blank')}
                      style={{
                        background: 'none', border: '0.5px solid #E7E3DF',
                        borderRadius: 6, padding: '4px 6px',
                        cursor: 'pointer', color: '#78716C',
                        display: 'flex', alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <ArrowDownTrayIcon style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                      style={{
                        background: 'none', border: '0.5px solid #FCD9C4',
                        borderRadius: 6, padding: '4px 6px',
                        cursor: deleting === file.id ? 'not-allowed' : 'pointer',
                        color: '#EA580C', opacity: deleting === file.id ? 0.5 : 1,
                        display: 'flex', alignItems: 'center',
                        transition: 'all 0.15s ease',
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
                Showing {filtered.length} of {files.length} files
              </span>
              <button
                onClick={() => window.open('/api/files/export', '_blank')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 500,
                  border: '0.5px solid #E7E3DF', borderRadius: 8,
                  backgroundColor: '#fff', color: '#78716C', cursor: 'pointer',
                }}
              >
                <ArrowDownTrayIcon style={{ width: 13, height: 13 }} />
                Export list
              </button>
            </div>
          </>
        )}
      </div>

      {/* Preview modal */}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </Layout>
  )
}