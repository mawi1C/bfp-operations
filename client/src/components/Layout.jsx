import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  FolderIcon,
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
  BellIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { label: 'Main', items: [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/query', icon: ChatBubbleLeftRightIcon, label: 'Query / Chat' },
    { to: '/search', icon: MagnifyingGlassIcon, label: 'Search' },
    { to: '/upload', icon: ArrowUpTrayIcon, label: 'Upload File' },
  ]},
  { label: 'Records', items: [
    { to: '/incidents', icon: DocumentTextIcon, label: 'Incidents' },
    { to: '/files', icon: FolderIcon, label: 'Files' },
    { to: '/reports', icon: ChartBarIcon, label: 'Reports' },
  ]},
  { label: 'Admin', items: [
    { to: '/users', icon: UsersIcon, label: 'Users' },
    { to: '/audit-logs', icon: ClipboardDocumentListIcon, label: 'Audit Logs' },
  ]},
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FFF8F4' }}>

      {/* Topbar */}
      <div style={{
        height: 52,
        backgroundColor: '#fff',
        borderBottom: '0.5px solid #F0EDE9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            backgroundColor: '#EA580C',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FireIcon style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1917' }}>
            BFP Incident Tracker
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', padding: 4 }}>
            <BellIcon style={{ width: 20, height: 20 }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30,
              backgroundColor: '#FFF1EB',
              border: '0.5px solid #FCD9C4',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 500, color: '#EA580C',
            }}>
              {initials}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#1C1917' }}>{user?.full_name}</div>
              <div style={{ fontSize: 11, color: '#A8A29E', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link-hover"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#A8A29E', padding: 4, borderRadius: 6,
              transition: 'color 0.15s ease',
            }}
            title="Logout"
          >
            <ArrowRightOnRectangleIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{
          width: 200,
          backgroundColor: '#fff',
          borderRight: '0.5px solid #F0EDE9',
          padding: '12px 0',
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          {navItems.map(group => (
            <div key={group.label}>
              <div style={{
                fontSize: 10,
                fontWeight: 500,
                color: '#C4BFB9',
                padding: '10px 16px 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {group.label}
              </div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => isActive ? '' : 'nav-link-hover'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#EA580C' : '#78716C',
                    backgroundColor: isActive ? '#FFF1EB' : 'transparent',
                    borderRight: isActive ? '2px solid #EA580C' : '2px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="page-enter" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}