import { type ReactNode, type ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AdminRoute = ({ children }: { children: ReactNode }): ReactElement => {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="bd-spinner"><div className="bd-spin-ring" /></div>
      </div>
    )
  }

  // 미로그인 → 로그인 페이지 (돌아올 경로 보존)
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // 비관리자 → 403 안내 페이지
  if (!isAdmin) {
    return (
      <section style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px', padding: '48px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px' }}>🚫</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2224' }}>접근 권한 없음</h2>
        <p style={{ color: '#7A7F83', fontSize: '15px', maxWidth: '360px', lineHeight: 1.6 }}>
          이 페이지는 관리자만 접근할 수 있습니다.<br/>
          권한이 필요하시면 관리자에게 문의하세요.
        </p>
        <a href="/kdn-board/" style={{
          marginTop: '8px', padding: '12px 24px', background: 'linear-gradient(135deg,#E4002B,#F0851A)',
          color: 'white', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '14px',
        }}>
          홈으로 돌아가기
        </a>
      </section>
    )
  }

  return <>{children}</>
}

export default AdminRoute
