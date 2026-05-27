/**
 * 접속 로그 · 활동 로그 · 개인정보 동의 기록 유틸
 * 모든 함수는 fire-and-forget — 실패해도 UI에 영향 없음
 */
import { supabase } from './supabase'

// ── IP 캐시 ──────────────────────────────────────────────────
let _ip: string | null = null
export const getClientIp = async (): Promise<string> => {
  if (_ip) return _ip
  try {
    const r = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    })
    const d = await r.json() as { ip: string }
    _ip = d.ip
    return _ip
  } catch {
    return 'unknown'
  }
}

// ── 접속 로그 ────────────────────────────────────────────────
export const logLogin = async (
  userId: string | null,
  email: string,
  action: 'login' | 'logout' | 'failed',
): Promise<void> => {
  try {
    const ip = await getClientIp()
    await supabase.from('login_logs').insert({
      user_id:    userId,
      email,
      action,
      ip_address: ip,
      user_agent: navigator.userAgent,
    })
  } catch { /* 무시 */ }
}

// ── 활동 로그 ────────────────────────────────────────────────
export type ActivityAction =
  | 'post_view'
  | 'post_create'
  | 'post_edit'
  | 'post_delete'
  | 'post_search'

export const logActivity = async (
  userId: string,
  email: string,
  action: ActivityAction,
  targetId?: string,
  targetTitle?: string,
  extra?: Record<string, unknown>,
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      user_id:      userId,
      email,
      action,
      target_id:    targetId  ?? null,
      target_title: targetTitle ?? null,
      extra:        extra ?? null,
    })
  } catch { /* 무시 */ }
}

// ── 개인정보 동의 기록 ────────────────────────────────────────
export const logConsent = async (
  userId: string,
  email: string,
  ip?: string,
): Promise<void> => {
  try {
    const resolvedIp = ip ?? await getClientIp()
    await supabase.from('privacy_consents').insert({
      user_id:    userId,
      email,
      version:    '1.0',
      ip_address: resolvedIp,
    })
  } catch { /* 무시 */ }
}
