import { useState, useEffect, type ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { path: '/about',    label: '회사소개' },
  { path: '/business', label: '솔루션·서비스' },
  { path: '/contact',  label: '국민소통' },
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
            {LINKS.map(({ path, label }) => (
              <li key={label}>
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

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        {LINKS.map(({ path, label }) => (
          <Link key={label} to={path}>{label}</Link>
        ))}
        <Link to="/contact" className="btn btn-primary">국민소통</Link>
      </div>
    </>
  )
}

export default Navbar
