import { useState, useEffect, useRef, type ReactElement } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type SimpleLink    = { kind: 'link';     path: string; label: string }
type DropdownLink  = { kind: 'dropdown'; label: string; children: { path: string; label: string }[] }
type NavItem       = SimpleLink | DropdownLink

const LINKS: NavItem[] = [
  { kind: 'link',     path: '/about',    label: '회사소개' },
  { kind: 'link',     path: '/business', label: '솔루션·서비스' },
  {
    kind: 'dropdown',
    label: '교육과정',
    children: [
      { path: '/curriculum/day25', label: '2.5일차 — 2026 개발 트렌드' },
    ],
  },
  { kind: 'link',     path: '/board',    label: '자유게시판' },
  { kind: 'link',     path: '/contact',  label: '국민소통' },
]

const Navbar = (): ReactElement => {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)
  const [userMenuOpen,setUserMenuOpen]= useState(false)
  const dropRef     = useRef<HTMLLIElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const location    = useLocation()
  const navigate    = useNavigate()
  const { user, signOut, loading, isAdmin } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false); setDropOpen(false); setUserMenuOpen(false) }, [location])

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // 이메일 표시용 단축 (앞 부분 + 도메인 첫글자)
  const userLabel = user?.email
    ? user.email.length > 20
      ? user.email.slice(0, 14) + '…'
      : user.email
    : ''

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-brand">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="kdnMarkGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E4002B"/>
                  <stop offset="100%" stopColor="#F0851A"/>
                </linearGradient>
              </defs>
              <rect width="42" height="42" rx="10" fill="url(#kdnMarkGrad)"/>
              <path d="M25 6L13 23h9l-5 13L35 19h-10L25 6z" fill="white" fillOpacity="0.95"/>
            </svg>
            <div>
              <div className="nav-brand-text">한전KDN</div>
              <div className="nav-brand-sub">Korea Electric Power Data &amp; Network</div>
            </div>
          </Link>

          <ul className="nav-links">
            {LINKS.map((link) => {
              if (link.kind === 'dropdown') {
                const isActive = link.children.some(c => location.pathname === c.path)
                return (
                  <li key={link.label} ref={dropRef} className="nav-dropdown-wrap">
                    <button
                      className={`nav-drop-btn${isActive ? ' active' : ''}${dropOpen ? ' open' : ''}`}
                      onClick={() => setDropOpen(o => !o)}
                      aria-haspopup="true"
                      aria-expanded={dropOpen}
                    >
                      {link.label}
                      <svg className="nav-drop-chevron" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {dropOpen && (
                      <ul className="nav-dropdown">
                        {link.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              className={`nav-dropdown-item${location.pathname === child.path ? ' active' : ''}`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              }
              return (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className={location.pathname === link.path ? 'active' : ''}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* CTA + 인증 영역 */}
          <div className="nav-right">
            {!loading && (
              user ? (
                /* 로그인 상태 */
                <div className="nav-user-wrap" ref={userMenuRef}>
                  <button
                    className={`nav-user-btn${userMenuOpen ? ' open' : ''}`}
                    onClick={() => setUserMenuOpen(v => !v)}
                    aria-label="사용자 메뉴"
                  >
                    <span className="nav-user-avatar">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                    <span className="nav-user-label">{userLabel}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="nav-user-dropdown">
                      <div className="nav-user-info">
                        <div className="nav-user-info-avatar">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="nav-user-info-email">{user.email}</div>
                          <div className="nav-user-info-role">회원</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <>
                          <div className="nav-user-divider" />
                          <Link to="/admin/users" className="nav-user-menu-item nav-user-admin">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 1l1.4 2.8L11.5 4.4l-2.3 2.3.5 3.2L7 8.5 4.3 9.9l.5-3.2L2.5 4.4l3.1-.6L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                            </svg>
                            관리자 패널
                          </Link>
                        </>
                      )}
                      <div className="nav-user-divider" />
                      <button className="nav-user-menu-item nav-user-logout" onClick={handleSignOut}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 12H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* 비로그인 상태 */
                <div className="nav-auth-btns">
                  <Link to="/login" className="nav-login-btn">로그인</Link>
                  <Link to="/register" className="btn btn-primary nav-signup-btn">
                    회원가입
                    <svg className="btn-arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                  </Link>
                </div>
              )
            )}
          </div>

          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="메뉴"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {LINKS.map((link) => {
          if (link.kind === 'dropdown') {
            return (
              <div key={link.label} className="mobile-submenu-group">
                <div className="mobile-submenu-label">{link.label}</div>
                {link.children.map((child) => (
                  <Link key={child.path} to={child.path} className="mobile-submenu-item">
                    {child.label}
                  </Link>
                ))}
              </div>
            )
          }
          return <Link key={link.label} to={link.path}>{link.label}</Link>
        })}
        <div className="mobile-auth-area">
          {user ? (
            <>
              <div className="mobile-user-email">{user.email}</div>
              <button className="btn btn-outline mobile-logout-btn" onClick={handleSignOut}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline">로그인</Link>
              <Link to="/register" className="btn btn-primary">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
