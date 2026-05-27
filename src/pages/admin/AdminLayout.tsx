import { type ReactNode, type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

type NavItem = { path: string; label: string; icon: ReactElement }

const NAV_ITEMS: NavItem[] = [
  {
    path: '/admin/users',
    label: '사용자 관리',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 16c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/roles',
    label: '권한 관리',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2l1.8 3.6L15 6.3l-3 2.9.7 4.1L9 11.4 5.3 13.3l.7-4.1L3 6.3l4.2-.7L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/login-logs',
    label: '접속 기록',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7h8M5 10h5M5 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    path: '/admin/activity-logs',
    label: '활동 기록',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9h2l2.5-5 3 9 2.5-6L14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const AdminLayout = ({ children }: { children: ReactNode }): ReactElement => {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="adm-layout">
      {/* 사이드바 */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2z" stroke="white" strokeWidth="1.5"/>
              <path d="M10 6v4l3 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="adm-sidebar-title">관리자 패널</div>
            <div className="adm-sidebar-email">{user?.email}</div>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`adm-nav-item${location.pathname === item.path ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-back-link">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="adm-main">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
