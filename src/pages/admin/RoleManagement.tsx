import { type ReactElement, useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// ── 타입 ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string
  email: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  updated_at: string
}

type LoginLog = {
  id: string
  user_id: string | null
  email: string
  action: 'login' | 'logout' | 'failed'
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

type ActivityLog = {
  id: string
  user_id: string | null
  email: string
  action: string
  target_id: string | null
  target_title: string | null
  extra: Record<string, unknown> | null
  created_at: string
}

// LoginLog, ActivityLog 는 이 파일에서 직접 사용하지 않지만 공통 타입 정의 요건에 따라 포함
void (null as unknown as LoginLog)
void (null as unknown as ActivityLog)

// ── 날짜 포맷 ────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

// ── 통계 타입 ────────────────────────────────────────────────────────────────
type Stats = {
  total: number
  adminCount: number
  userCount: number
}

export default function RoleManagement(): ReactElement {
  const { user } = useAuth()

  const [admins, setAdmins] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, adminCount: 0, userCount: 0 })
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // 승격 검색
  const [promoteEmail, setPromoteEmail] = useState('')
  const [promoteResults, setPromoteResults] = useState<Profile[]>([])
  const [promoteSearching, setPromoteSearching] = useState(false)
  const [promoteError, setPromoteError] = useState<string | null>(null)

  // ── 데이터 로드 ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      // 통계용 전체 집계
      const { data: allProfiles, error: allErr } = await supabase
        .from('profiles')
        .select('role')

      if (allErr) throw allErr

      const profiles = (allProfiles as Pick<Profile, 'role'>[]) ?? []
      const adminCount = profiles.filter(p => p.role === 'admin').length
      setStats({
        total: profiles.length,
        adminCount,
        userCount: profiles.length - adminCount,
      })

      // 관리자 목록
      const { data: adminData, error: adminErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (adminErr) throw adminErr
      setAdmins((adminData as Profile[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  // ── 관리자 해제 ────────────────────────────────────────────────────────────
  const handleDemote = async (profile: Profile): Promise<void> => {
    if (user?.id === profile.id) return
    setActionLoading(`demote-${profile.id}`)
    setError(null)
    try {
      const { error: err } = await supabase.rpc('set_user_role', {
        target_user_id: profile.id,
        new_role: 'user',
      })
      if (err) throw err
      setSuccessMsg(`${profile.email} 관리자 권한이 해제되었습니다.`)
      void fetchData()
    } catch (e) {
      setError(e instanceof Error ? e.message : '역할 변경 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  // ── 일반사용자 검색 (승격용) ───────────────────────────────────────────────
  const handlePromoteSearch = async (): Promise<void> => {
    if (!promoteEmail.trim()) {
      setPromoteError('이메일을 입력해주세요.')
      return
    }
    setPromoteSearching(true)
    setPromoteError(null)
    setPromoteResults([])
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .ilike('email', `%${promoteEmail.trim()}%`)
        .limit(10)

      if (err) throw err
      const results = (data as Profile[]) ?? []
      if (results.length === 0) {
        setPromoteError('검색된 일반사용자가 없습니다.')
      }
      setPromoteResults(results)
    } catch (e) {
      setPromoteError(e instanceof Error ? e.message : '검색 중 오류가 발생했습니다.')
    } finally {
      setPromoteSearching(false)
    }
  }

  const handlePromoteSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') void handlePromoteSearch()
  }

  // ── 관리자 승격 ────────────────────────────────────────────────────────────
  const handlePromote = async (profile: Profile): Promise<void> => {
    setActionLoading(`promote-${profile.id}`)
    setPromoteError(null)
    try {
      const { error: err } = await supabase.rpc('set_user_role', {
        target_user_id: profile.id,
        new_role: 'admin',
      })
      if (err) throw err
      setSuccessMsg(`${profile.email}이(가) 관리자로 승격되었습니다.`)
      setPromoteEmail('')
      setPromoteResults([])
      void fetchData()
    } catch (e) {
      setPromoteError(e instanceof Error ? e.message : '승격 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  // ── 알림 자동 제거 ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(null), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h2 className="adm-page-title">역할 관리</h2>
        <p className="adm-page-subtitle">관리자 권한을 부여하거나 해제합니다.</p>
      </div>

      {/* 알림 */}
      {error && (
        <div className="adm-alert adm-alert--error">
          <span>{error}</span>
          <button className="adm-alert__close" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="adm-alert adm-alert--success">
          <span>{successMsg}</span>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <span className="adm-stat-card__label">전체 사용자</span>
          <span className="adm-stat-card__value">{stats.total.toLocaleString()}</span>
        </div>
        <div className="adm-stat-card adm-stat-card--admin">
          <span className="adm-stat-card__label">관리자</span>
          <span className="adm-stat-card__value">{stats.adminCount.toLocaleString()}</span>
        </div>
        <div className="adm-stat-card adm-stat-card--user">
          <span className="adm-stat-card__label">일반사용자</span>
          <span className="adm-stat-card__value">{stats.userCount.toLocaleString()}</span>
        </div>
      </div>

      {/* 관리자 목록 */}
      <section className="adm-section">
        <h3 className="adm-section-title">관리자 목록</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th className="adm-th adm-th--no">번호</th>
                <th className="adm-th">이메일</th>
                <th className="adm-th">가입일</th>
                <th className="adm-th adm-th--action">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="adm-td adm-td--center">
                    <span className="adm-spinner" />
                    <span className="adm-loading-text">불러오는 중...</span>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="adm-td adm-td--center adm-td--empty">
                    관리자가 없습니다.
                  </td>
                </tr>
              ) : (
                admins.map((admin, idx) => {
                  const isSelf = user?.id === admin.id
                  const isDemoting = actionLoading === `demote-${admin.id}`
                  return (
                    <tr key={admin.id} className={`adm-tr ${isSelf ? 'adm-tr--self' : ''}`}>
                      <td className="adm-td adm-td--no">{idx + 1}</td>
                      <td className="adm-td adm-td--email">
                        {admin.email}
                        {isSelf && <span className="adm-badge adm-badge--self">나</span>}
                      </td>
                      <td className="adm-td adm-td--date">{fmtDate(admin.created_at)}</td>
                      <td className="adm-td adm-td--action">
                        <button
                          className="adm-btn adm-btn--sm adm-btn--danger"
                          disabled={isSelf || isDemoting}
                          onClick={() => void handleDemote(admin)}
                          title={isSelf ? '본인 권한은 해제할 수 없습니다.' : undefined}
                        >
                          {isDemoting ? '처리 중...' : '관리자 해제'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 관리자 승격 섹션 */}
      <section className="adm-section">
        <h3 className="adm-section-title">일반사용자 → 관리자 승격</h3>
        <div className="adm-promote-form">
          <div className="adm-search-group">
            <input
              className="adm-search-input"
              type="text"
              placeholder="승격할 사용자 이메일 검색..."
              value={promoteEmail}
              onChange={e => setPromoteEmail(e.target.value)}
              onKeyDown={handlePromoteSearchKeyDown}
            />
            <button
              className="adm-btn adm-btn--primary"
              disabled={promoteSearching}
              onClick={() => void handlePromoteSearch()}
            >
              {promoteSearching ? '검색 중...' : '검색'}
            </button>
          </div>
          {promoteError && (
            <p className="adm-form-error">{promoteError}</p>
          )}
        </div>

        {promoteResults.length > 0 && (
          <div className="adm-table-wrap adm-table-wrap--promote">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="adm-th">이메일</th>
                  <th className="adm-th">가입일</th>
                  <th className="adm-th adm-th--action">액션</th>
                </tr>
              </thead>
              <tbody>
                {promoteResults.map(profile => {
                  const isPromoting = actionLoading === `promote-${profile.id}`
                  return (
                    <tr key={profile.id} className="adm-tr">
                      <td className="adm-td adm-td--email">{profile.email}</td>
                      <td className="adm-td adm-td--date">{fmtDate(profile.created_at)}</td>
                      <td className="adm-td adm-td--action">
                        <button
                          className="adm-btn adm-btn--sm adm-btn--primary"
                          disabled={isPromoting}
                          onClick={() => void handlePromote(profile)}
                        >
                          {isPromoting ? '처리 중...' : '관리자 지정'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
