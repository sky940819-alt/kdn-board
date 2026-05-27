import { useState, type ReactElement, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getClientIp } from '../lib/logger'

// ── 개인정보 처리방침 본문 ────────────────────────────────────
const PRIVACY_POLICY = `제 1조 (개인정보의 수집 항목 및 방법)

회사는 서비스 제공을 위해 최소한의 개인정보를 수집합니다.

■ 필수 수집 항목
  - 이메일 주소 (회원 식별 및 로그인에 사용)

■ 자동 수집 항목
  - 서비스 이용 기록, 접속 일시, IP 주소
  - 브라우저 종류 및 버전 정보
  - 게시물 작성·수정·삭제 등 활동 이력


제 2조 (개인정보의 수집 및 이용 목적)

수집된 개인정보는 다음 목적으로만 이용됩니다.

  ① 회원 식별 및 본인 확인
  ② 서비스 이용 기록 관리 및 통계 분석
  ③ 불법·부적절한 이용 탐지 및 보안 사고 예방
  ④ 서비스 품질 개선


제 3조 (개인정보의 보유 및 이용 기간)

개인정보는 수집·이용 목적이 달성된 후 지체 없이 파기합니다.
단, 관계 법령의 규정에 따라 보존할 필요가 있는 경우에는 아래 기간 동안 보존합니다.

  - 접속 기록 : 3개월 (통신비밀보호법)
  - 소비자 불만·분쟁 기록 : 3년 (전자상거래 등 소비자보호법)


제 4조 (개인정보의 제3자 제공)

회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
다만, 아래의 경우에는 예외로 합니다.

  - 이용자가 사전에 동의한 경우
  - 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우


제 5조 (개인정보의 파기 절차 및 방법)

전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.


제 6조 (이용자의 권리와 의무)

이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 처리 정지를 요청할 수 있습니다.
이용자가 개인정보를 최신 상태로 정확하게 입력할 의무가 있으며, 부정확한 정보 입력으로 발생하는 문제의 책임은 이용자 본인에게 있습니다.


제 7조 (동의 거부권 및 불이익)

귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.
단, 동의를 거부하시는 경우 회원 가입 및 서비스 이용이 제한됩니다.


시행일: 2026년 1월 1일
한전KDN (Korea Electric Power Data & Network Co., Ltd.)`

// ── 비밀번호 강도 측정 ───────────────────────────────────────
const pwStrength = (pw: string): { level: 0|1|2|3; label: string; color: string } => {
  if (pw.length === 0) return { level: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw))   score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { level: 1, label: '약함',   color: '#dc2626' }
  if (score <= 3) return { level: 2, label: '보통',   color: '#f59e0b' }
  return             { level: 3, label: '강함',   color: '#16a34a' }
}

// ── Register 컴포넌트 ─────────────────────────────────────────
const Register = (): ReactElement => {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [pwConf,  setPwConf]  = useState('')
  const [consent, setConsent] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [showPwC, setShowPwC] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = pwStrength(pw)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!email.trim())
      return setError('이메일을 입력해주세요.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError('올바른 이메일 형식이 아닙니다.')
    if (pw.length < 8)
      return setError('비밀번호는 8자 이상이어야 합니다.')
    if (pw !== pwConf)
      return setError('비밀번호가 일치하지 않습니다.')
    if (!consent)
      return setError('개인정보 수집·이용에 동의해주세요.')

    setLoading(true)
    const ip = await getClientIp()
    const { error: err, needsConfirm } = await signUp(email.trim(), pw, ip)
    setLoading(false)

    if (err) { setError(err); return }

    if (needsConfirm) {
      setSuccess(
        `${email.trim()} 로 인증 메일을 발송했습니다.\n메일함을 확인하여 이메일 인증을 완료해주세요.`
      )
    } else {
      navigate('/', { replace: true })
    }
  }

  // ── 이메일 인증 필요 안내 화면 ─────────────────────────────
  if (success) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <div className="auth-success-icon">✉️</div>
          <h2 className="auth-title">이메일을 확인해주세요</h2>
          <p className="auth-desc" style={{ whiteSpace: 'pre-line' }}>{success}</p>
          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              로그인 화면으로
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-page">
      <div className="auth-card">

        {/* 로고 */}
        <div className="auth-brand">
          <svg width="44" height="44" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lgReg" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E4002B"/>
                <stop offset="100%" stopColor="#F0851A"/>
              </linearGradient>
            </defs>
            <rect width="42" height="42" rx="10" fill="url(#lgReg)"/>
            <path d="M25 6L13 23h9l-5 13L35 19h-10L25 6z" fill="white" fillOpacity="0.95"/>
          </svg>
          <div>
            <div className="auth-brand-name">한전KDN</div>
            <div className="auth-brand-sub">Korea Electric Power Data &amp; Network</div>
          </div>
        </div>

        <h2 className="auth-title">회원가입</h2>
        <p className="auth-desc">이메일로 계정을 만드세요.</p>

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

          {/* 이메일 */}
          <div className="auth-field">
            <label className="auth-lbl" htmlFor="reg-email">이메일 <span className="auth-req">*</span></label>
            <input
              id="reg-email"
              type="email"
              className="auth-inp"
              placeholder="example@kdn.com"
              value={email}
              autoComplete="email"
              autoFocus
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div className="auth-field">
            <label className="auth-lbl" htmlFor="reg-pw">
              비밀번호 <span className="auth-req">*</span>
              <span className="auth-lbl-hint"> (8자 이상)</span>
            </label>
            <div className="auth-inp-wrap">
              <input
                id="reg-pw"
                type={showPw ? 'text' : 'password'}
                className="auth-inp auth-inp--pw"
                placeholder="8자 이상 입력"
                value={pw}
                autoComplete="new-password"
                onChange={e => setPw(e.target.value)}
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw
                  ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#7A7F83" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="#7A7F83" strokeWidth="1.4"/><path d="M2 2l14 14" stroke="#7A7F83" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#7A7F83" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="#7A7F83" strokeWidth="1.4"/></svg>
                }
              </button>
            </div>
            {/* 비밀번호 강도 표시 */}
            {pw.length > 0 && (
              <div className="pw-strength">
                <div className="pw-strength-bar">
                  {[1,2,3].map(i => (
                    <div
                      key={i}
                      className="pw-strength-seg"
                      style={{ background: strength.level >= i ? strength.color : '#DCDFE0' }}
                    />
                  ))}
                </div>
                <span className="pw-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="auth-field">
            <label className="auth-lbl" htmlFor="reg-pwc">비밀번호 확인 <span className="auth-req">*</span></label>
            <div className="auth-inp-wrap">
              <input
                id="reg-pwc"
                type={showPwC ? 'text' : 'password'}
                className={`auth-inp auth-inp--pw${pwConf && pw !== pwConf ? ' auth-inp--err' : ''}`}
                placeholder="비밀번호 재입력"
                value={pwConf}
                autoComplete="new-password"
                onChange={e => setPwConf(e.target.value)}
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPwC(v => !v)}>
                {showPwC
                  ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#7A7F83" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="#7A7F83" strokeWidth="1.4"/><path d="M2 2l14 14" stroke="#7A7F83" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#7A7F83" strokeWidth="1.4"/><circle cx="9" cy="9" r="2" stroke="#7A7F83" strokeWidth="1.4"/></svg>
                }
              </button>
            </div>
            {pwConf && pw !== pwConf && (
              <p className="auth-field-err">비밀번호가 일치하지 않습니다.</p>
            )}
            {pwConf && pw === pwConf && pw.length >= 8 && (
              <p className="auth-field-ok">✓ 비밀번호가 일치합니다.</p>
            )}
          </div>

          {/* 개인정보 동의 */}
          <div className="privacy-box">
            <div className="privacy-header">
              <div className="privacy-icon">🔒</div>
              <div>
                <div className="privacy-title">개인정보 수집·이용 동의</div>
                <div className="privacy-subtitle">한전KDN 서비스 이용을 위해 필요합니다.</div>
              </div>
              <button
                type="button"
                className="privacy-toggle"
                onClick={() => setPolicyOpen(v => !v)}
                aria-expanded={policyOpen}
              >
                {policyOpen ? '접기' : '전문보기'}
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ transform: policyOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                >
                  <path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* 정책 본문 (펼침/접힘) */}
            {policyOpen && (
              <div className="privacy-content">
                <pre className="privacy-text">{PRIVACY_POLICY}</pre>
              </div>
            )}

            {/* 동의 체크박스 */}
            <label className="privacy-check">
              <input
                type="checkbox"
                className="privacy-checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
              />
              <span className="privacy-check-box" aria-hidden="true">
                {consent && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span>
                위 개인정보 수집·이용에 <strong>동의합니다</strong>.
                <span className="auth-req"> (필수)</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? <><span className="auth-spin" /> 가입 처리 중…</>
              : '회원가입'
            }
          </button>
        </form>

        <div className="auth-footer">
          이미 계정이 있으신가요?&nbsp;
          <Link to="/login" className="auth-link">로그인</Link>
        </div>
      </div>
    </section>
  )
}

export default Register
