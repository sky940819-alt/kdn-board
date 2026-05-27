import {
  createContext, useContext, useEffect, useRef, useState,
  type ReactNode, type ReactElement,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { logLogin, logConsent } from '../lib/logger'

// ── 세션 타임아웃 설정 ───────────────────────────────────────
const IDLE_LIMIT_MS = 10 * 60 * 1000   // 10분: 비활동 자동 로그아웃
const WARN_BEFORE_MS =  1 * 60 * 1000  // 만료 1분 전 경고 표시

// ── 타입 ────────────────────────────────────────────────────
type Role = 'admin' | 'user'

type SignInResult = { error: string | null }
type SignUpResult = { error: string | null; needsConfirm?: boolean }

type AuthCtx = {
  user:     User | null
  session:  Session | null
  role:     Role | null
  isAdmin:  boolean
  loading:  boolean
  signIn(email: string, password: string): Promise<SignInResult>
  signUp(email: string, password: string, consentIp?: string): Promise<SignUpResult>
  signOut(): Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

// ── Hook ─────────────────────────────────────────────────────
export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ── 역할 조회 (5초 타임아웃) ─────────────────────────────────
const fetchRole = async (userId: string): Promise<Role> => {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .abortSignal(controller.signal)
      .single()
    clearTimeout(timer)
    return (data?.role as Role) ?? 'user'
  } catch {
    return 'user'
  }
}

// ── Provider ─────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [user,    setUser]    = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role,    setRole]    = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  // 세션 만료 경고 상태 (만료 1분 전 표시)
  const [idleWarning, setIdleWarning] = useState(false)
  // 경고 팝업에서 남은 시간(초) 카운트다운
  const [countdown,   setCountdown]   = useState(60)

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── 아이들 타이머 해제 ──────────────────────────────────────
  const clearIdleTimers = () => {
    if (idleTimerRef.current)   clearTimeout(idleTimerRef.current)
    if (warnTimerRef.current)   clearTimeout(warnTimerRef.current)
    if (countdownRef.current)   clearInterval(countdownRef.current)
  }

  // ── 아이들 타이머 재설정 ────────────────────────────────────
  const resetIdleTimer = () => {
    clearIdleTimers()
    setIdleWarning(false)
    setCountdown(60)

    // 9분 후 → 경고 팝업 + 1분 카운트다운
    warnTimerRef.current = setTimeout(() => {
      setIdleWarning(true)
      setCountdown(60)
      countdownRef.current = setInterval(() => {
        setCountdown(s => s - 1)
      }, 1000)
    }, IDLE_LIMIT_MS - WARN_BEFORE_MS)

    // 10분 후 → 자동 로그아웃
    idleTimerRef.current = setTimeout(() => {
      clearIdleTimers()
      setIdleWarning(false)
      void supabase.auth.signOut()
    }, IDLE_LIMIT_MS)
  }

  // ── 로그인 상태일 때만 아이들 감지 활성화 ───────────────────
  useEffect(() => {
    if (!user) {
      clearIdleTimers()
      setIdleWarning(false)
      return
    }

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const
    const handler = () => resetIdleTimer()
    EVENTS.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetIdleTimer()

    return () => {
      clearIdleTimers()
      EVENTS.forEach(e => window.removeEventListener(e, handler))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── 세션 초기화 ──────────────────────────────────────────────
  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 6000)

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession()
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
        clearTimeout(safetyTimer)
        if (s?.user) {
          const r = await fetchRole(s.user.id)
          setRole(r)
        }
      } catch {
        setLoading(false)
        clearTimeout(safetyTimer)
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        const r = await fetchRole(s.user.id)
        setRole(r)
      } else {
        setRole(null)
      }
    })

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [])

  // ── 로그인 ──────────────────────────────────────────────────
  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      void logLogin(null, email, 'failed')
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid') || msg.includes('credentials'))
        return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      if (msg.includes('confirm'))
        return { error: '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.' }
      return { error: '로그인 중 오류가 발생했습니다.' }
    }
    void logLogin(data.user.id, data.user.email!, 'login')
    return { error: null }
  }

  // ── 회원가입 ─────────────────────────────────────────────────
  const signUp = async (
    email: string,
    password: string,
    consentIp?: string,
  ): Promise<SignUpResult> => {
    // Admin 경로: service key 있으면 이메일 발송 없이 즉시 계정 생성
    if (supabaseAdmin) {
      const { data: adminData, error: adminErr } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
      if (adminErr) {
        const msg = adminErr.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('already exists'))
          return { error: '이미 사용 중인 이메일입니다.' }
        return { error: '회원가입 중 오류가 발생했습니다.' }
      }
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (adminData.user) {
        void logConsent(adminData.user.id, email, consentIp)
        if (!signInErr) void logLogin(adminData.user.id, email, 'login')
      }
      return { error: null, needsConfirm: false }
    }

    // Fallback: service key 없을 때 일반 signUp
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered'))
        return { error: '이미 사용 중인 이메일입니다.' }
      if (msg.includes('rate limit') || msg.includes('429'))
        return { error: '잠시 후 다시 시도해주세요. (이메일 발송 한도 초과)' }
      return { error: '회원가입 중 오류가 발생했습니다.' }
    }
    let needsConfirm = !data.session
    if (data.user) {
      void logConsent(data.user.id, email, consentIp)
      if (!needsConfirm) void logLogin(data.user.id, email, 'login')
    }
    return { error: null, needsConfirm }
  }

  // ── 로그아웃 ─────────────────────────────────────────────────
  const signOut = async (): Promise<void> => {
    if (user) void logLogin(user.id, user.email!, 'logout')
    clearIdleTimers()
    setIdleWarning(false)
    await supabase.auth.signOut()
    setRole(null)
  }

  // ── 세션 만료 경고 팝업 ──────────────────────────────────────
  const TimeoutWarning = idleWarning ? (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-2)',
        borderRadius: '16px',
        padding: '40px 48px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
          세션 만료 임박
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>
          10분간 활동이 없어 곧 자동 로그아웃됩니다.
        </p>
        <p style={{
          fontSize: '36px', fontWeight: 800,
          color: countdown <= 30 ? '#E4002B' : 'var(--text-primary)',
          margin: '16px 0 24px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(Math.floor(countdown / 60)).padStart(2,'0')}:{String(countdown % 60).padStart(2,'0')}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => void signOut()}
          >
            지금 로그아웃
          </button>
          <button
            className="btn btn-primary"
            onClick={resetIdleTimer}
          >
            계속 사용하기
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <AuthContext.Provider value={{
      user, session, role, isAdmin: role === 'admin', loading,
      signIn, signUp, signOut,
    }}>
      {children}
      {TimeoutWarning}
    </AuthContext.Provider>
  )
}
