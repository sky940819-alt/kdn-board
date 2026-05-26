import { useState, useEffect, type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { path: '/',         label: '홈' },
  { path: '/about',    label: '회사소개' },
  { path: '/business', label: '사업영역' },
  { path: '/news',     label: '뉴스&공지' },
  { path: '/contact',  label: '문의하기' },
]

const Navbar = (): ReactElement => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="nav-brand">
            <div className="nav-brand-mark">KDN</div>
            <div>
              <div className="nav-brand-text">한국전력기술</div>
              <div className="nav-brand-sub">Korea District Network</div>
            </div>
          </Link>

          <ul className="nav-links">
            {LINKS.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={location.pathname === path ? 'active' : ''}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-cta">
            <Link to="/contact" className="btn btn-primary">
              문의하기
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

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {LINKS.map(({ path, label }) => (
          <Link key={path} to={path}>{label}</Link>
        ))}
        <Link to="/contact" className="btn btn-primary">문의하기</Link>
      </div>
    </>
  )
}

export default Navbar
