import { useState, type ReactElement, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Login = (): ReactElement => {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = (location.state as { from?: string })?.from ?? '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim())   { setError('이메일을 입력해주세요.'); return }
    if (!password)       { setError('비밀번호를 입력해주세요.'); return }

    setLoading(true)
    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)

    if (err) { setError(err); return }
    navigate(from, { replace: true })
  }

  return (
    <section className="auth-page">
      <div className="auth-card">

        {/* 로고 */}
        <div className="auth-brand">
          <svg width="44" height="44" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lgLogin" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E4002B"/>
                <stop offset="100%" stopColor="#F0851A"/>
              </linearGradient>
            </defs>
            <rect width="42" height="42" rx="10" fill="url(#lgLogin)"/>
            <path d="M25 6L13 23h9l-5 13L35 19h-10L25 6z" fill="white" fillOpacity="0.95"/>
          </svg>
          <div>
            <div className="auth-brand-name">한전KDN</div>
            <div className="auth-brand-sub">Korea Electric Power Data &amp; Network</div>
          </div>
        </div>

        <h2 className="auth-title">로그인</h2>
        <p className="auth-desc">계정에 로그인하여 서비스를 이용하세요.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-err-box" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div className="auth-field">
            <label className="auth-lbl" htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              type="email"
              className="auth-inp"
              placeholder="example@kdn.com"
              value={email}
              autoComplete="email"
              autoFocus
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-lbl" htmlFor="login-pw">비밀번호</label>
            <div className="auth-inp-wrap">
              <input
                id="login-pw"
                type={showPw ? 'text' : 'password'}
                className="auth-inp auth-inp--pw"
                placeholder="비밀번호 입력"
                value={password}
                autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#7A7F83" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="#7A7F83" strokeWidth="1.4"/><path d="M2 2l14 14" stroke="#7A7F83" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#7A7F83" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="#7A7F83" strokeWidth="1.4"/></svg>
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? <><span className="auth-spin" /> 로그인 중…</>
              : '로그인'
            }
          </button>
        </form>

        <div className="auth-footer">
          계정이 없으신가요?&nbsp;
          <Link to="/register" className="auth-link">회원가입</Link>
        </div>
      </div>
    </section>
  )
}

export default Login
