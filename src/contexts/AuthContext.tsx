import {
  createContext, useContext, useEffect, useState,
  type ReactNode, type ReactElement,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { logLogin, logConsent } from '../lib/logger'

// ── 타입 ────────────────────────────────────────────────────
type Role = 'admin' | 'user'

type SignInResult  = { error: string | null }
type SignUpResult  = { error: string | null; needsConfirm?: boolean }

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

  useEffect(() => {
    // ── 안전 타임아웃: 최대 6초 내로 loading 해제 ────────────
    // Supabase 프리티어 hibernation 등으로 getSession()이 hang 되면
    // 로그인 버튼이 영원히 숨겨지는 문제를 방지
    const safetyTimer = setTimeout(() => setLoading(false), 6000)

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession()
        setSession(s)
        setUser(s?.user ?? null)
        // loading을 먼저 해제한 뒤 역할은 비동기로 처리
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
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered'))
        return { error: '이미 사용 중인 이메일입니다.' }
      return { error: '회원가입 중 오류가 발생했습니다.' }
    }
    let needsConfirm = !data.session

    // ── 이메일 인증 임시 비활성화 ──────────────────────────────
    // supabaseAdmin(service key)이 있으면 즉시 이메일 확인 처리 후 자동 로그인
    if (needsConfirm && data.user && supabaseAdmin) {
      const { error: confirmErr } = await supabaseAdmin.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true },
      )
      if (!confirmErr) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInErr) needsConfirm = false
      }
    }
    // ────────────────────────────────────────────────────────────

    if (data.user) {
      void logConsent(data.user.id, email, consentIp)
      if (!needsConfirm) void logLogin(data.user.id, email, 'login')
    }
    return { error: null, needsConfirm }
  }

  // ── 로그아웃 ─────────────────────────────────────────────────
  const signOut = async (): Promise<void> => {
    if (user) void logLogin(user.id, user.email!, 'logout')
    await supabase.auth.signOut()
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{
      user, session, role, isAdmin: role === 'admin', loading,
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
