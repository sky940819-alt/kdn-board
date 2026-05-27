import { useState, useEffect, useRef, type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'

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
  { kind: 'link',     path: '/contact',  label: '국민소통' },
]

const Navbar = (): ReactElement => {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [dropOpen, setDropOpen]       = useState(false)
  const dropRef                       = useRef<HTMLLIElement>(null)
  const location                      = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false); setDropOpen(false) }, [location])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-brand">
            {/* 한전KDN SVG 로고 마크 */}
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="kdnMarkGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E4002B"/>
                  <stop offset="100%" stopColor="#F0851A"/>
                </linearGradient>
              </defs>
              <rect width="42" height="42" rx="10" fill="url(#kdnMarkGrad)"/>
              {/* 번개 볼트 아이콘 */}
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
                // 드롭다운 메뉴
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
              // 일반 메뉴
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

          <div className="nav-cta">
            <Link to="/contact" className="btn btn-primary">
              국민소통
              <svg className="btn-arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </Link>
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
          return (
            <Link key={link.label} to={link.path}>{link.label}</Link>
          )
        })}
        <Link to="/contact" className="btn btn-primary">국민소통</Link>
      </div>
    </>
  )
}

export default Navbar
