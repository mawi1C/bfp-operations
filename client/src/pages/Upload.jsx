import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return { icon: DocumentTextIcon, color: '#DC2626', bg: '#FEF2F2' }
  if (['xlsx', 'xls', 'csv'].includes(ext)) return { icon: TableCellsIcon, color: '#16A34A', bg: '#F0FDF4' }
  if (['docx', 'doc'].includes(ext)) return { icon: DocumentIcon, color: '#2563EB', bg: '#EFF6FF' }
  return { icon: DocumentIcon, color: '#78716C', bg: '#F5F5F4' }
}

const getStatusBadge = (status) => {
  if (status === 'done') return { label: 'Done', color: '#16A34A', bg: '#F0FDF4' }
  if (status === 'uploading') return { label: 'Uploading', color: '#2563EB', bg: '#EFF6FF' }
  if (status === 'error') return { label: 'Failed', color: '#DC2626', bg: '#FEF2F2' }
  return { label: 'Pending', color: '#78716C', bg: '#F5F5F4' }
}

export default function Upload() {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const addFiles = (incoming) => {
    const newFiles = Array.from(incoming).map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      status: 'pending',
      progress: 0,
      error: null,
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleRemove = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFile = async (id) => {
    const fileObj = files.find(f => f.id === id)
    if (!fileObj) return

    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'uploading', progress: 0 } : f
    ))

    const formData = new FormData()
    formData.append('file', fileObj.file)

    try {
      await api.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setFiles(prev => prev.map(f =>
            f.id === id ? { ...f, progress: pct } : f
          ))
        },
      })
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'done', progress: 100 } : f
      ))
    } catch (err) {
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'error', error: err.response?.data?.error || 'Upload failed' } : f
      ))
    }
  }

  const handleUploadAll = () => {
    files.filter(f => f.status === 'pending').forEach(f => uploadFile(f.id))
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const doneCount = files.filter(f => f.status === 'done').length

  return (
    <Layout>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: '#1C1917', margin: 0 }}>Upload File</h1>
        <p style={{ fontSize: 13, color: '#A8A29E', margin: '4px 0 0' }}>
          Upload incident reports — system will extract and index the data automatically
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `1.5px dashed ${dragging ? '#EA580C' : '#F0D5C8'}`,
          borderRadius: 14,
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: dragging ? '#FFF1EB' : '#FFF8F4',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 20,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <div style={{
          width: 56, height: 56,
          backgroundColor: dragging ? '#EA580C' : '#FFF1EB',
          border: `0.5px solid ${dragging ? '#EA580C' : '#FCD9C4'}`,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          transition: 'all 0.2s ease',
        }}>
          <CloudArrowUpIcon style={{ width: 28, height: 28, color: dragging ? '#fff' : '#EA580C' }} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#1C1917', margin: '0 0 6px' }}>
          {dragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p style={{ fontSize: 13, color: '#A8A29E', margin: '0 0 16px' }}>
          or click to browse from your computer
        </p>
        <span style={{
          display: 'inline-block',
          fontSize: 13, fontWeight: 500,
          color: '#fff',
          backgroundColor: '#EA580C',
          borderRadius: 8,
          padding: '8px 20px',
          transition: 'background 0.2s ease',
        }}>
          Browse files
        </span>
        <p style={{ fontSize: 11, color: '#C4BFB9', marginTop: 12 }}>
          Accepted: PDF, DOCX, XLSX, CSV · Max 50MB per file
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '0.5px solid #F0EDE9', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '0.5px solid #F0EDE9',
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>
              {files.length} file{files.length > 1 ? 's' : ''} selected
              {doneCount > 0 && (
                <span style={{ fontSize: 12, color: '#16A34A', marginLeft: 8 }}>· {doneCount} uploaded</span>
              )}
            </span>
            {pendingCount > 0 && (
              <button
                onClick={handleUploadAll}
                className="btn-orange"
                style={{
                  backgroundColor: '#EA580C', color: '#fff',
                  border: 'none', borderRadius: 8,
                  padding: '7px 16px', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <CloudArrowUpIcon style={{ width: 15, height: 15 }} />
                Upload all ({pendingCount})
              </button>
            )}
          </div>

          {files.map((f, i) => {
            const { icon: Icon, color, bg } = getFileIcon(f.name)
            const badge = getStatusBadge(f.status)
            return (
              <div key={f.id} className="row-hover" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px',
                borderBottom: i < files.length - 1 ? '0.5px solid #F5F5F4' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#A8A29E' }}>{f.size} MB</span>
                    {f.status === 'uploading' && (
                      <div style={{ flex: 1, maxWidth: 200, height: 4, backgroundColor: '#F0EDE9', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${f.progress}%`,
                          backgroundColor: '#EA580C',
                          borderRadius: 2,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    )}
                    {f.error && (
                      <span style={{ fontSize: 11, color: '#DC2626' }}>{f.error}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {f.status === 'done' && <CheckCircleIcon style={{ width: 16, height: 16, color: '#16A34A' }} />}
                  {f.status === 'error' && <ExclamationTriangleIcon style={{ width: 16, height: 16, color: '#DC2626' }} />}
                  {f.status === 'uploading' && (
                    <ArrowPathIcon style={{ width: 16, height: 16, color: '#2563EB', animation: 'spin 1s linear infinite' }} />
                  )}
                  <span className="badge-pop" style={{
                    fontSize: 11, fontWeight: 500,
                    padding: '3px 10px', borderRadius: 20,
                    backgroundColor: badge.bg, color: badge.color,
                  }}>
                    {badge.label}
                  </span>
                  {f.status === 'pending' && (
                    <button
                      onClick={() => uploadFile(f.id)}
                      style={{
                        fontSize: 12, color: '#EA580C',
                        background: 'none', border: '0.5px solid #FCD9C4',
                        borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                      }}
                    >
                      Upload
                    </button>
                  )}
                  {f.status !== 'uploading' && (
                    <button
                      onClick={() => handleRemove(f.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4BFB9', padding: 2 }}
                    >
                      <XMarkIcon style={{ width: 16, height: 16 }} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'PDF files', desc: 'Incident reports, investigation documents, official memos', color: '#DC2626', bg: '#FEF2F2', icon: DocumentTextIcon },
          { label: 'Excel / CSV', desc: 'Batch incident data, monthly summaries, statistics tables', color: '#16A34A', bg: '#F0FDF4', icon: TableCellsIcon },
          { label: 'Word / DOCX', desc: 'Narrative reports, case files, field investigation notes', color: '#2563EB', bg: '#EFF6FF', icon: DocumentIcon },
        ].map(item => (
          <div key={item.label} className="panel-card" style={{
            backgroundColor: '#fff', border: '0.5px solid #F0EDE9',
            borderRadius: 12, padding: 16, 
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              backgroundColor: item.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 10,
            }}>
              <item.icon style={{ width: 18, height: 18, color: item.color }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#A8A29E', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  )
}