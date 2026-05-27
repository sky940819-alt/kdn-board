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

const PAGE_SIZE = 20

// ── 날짜 포맷 ────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export default function UserManagement(): ReactElement {
  const { user } = useAuth()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // ── 데이터 로드 ────────────────────────────────────────────────────────────
  const fetchProfiles = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (search.trim()) {
        query = query.ilike('email', `%${search.trim()}%`)
      }

      const { data, error: err, count } = await query

      if (err) throw err
      setProfiles((data as Profile[]) ?? [])
      setTotal(count ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    void fetchProfiles()
  }, [fetchProfiles])

  // ── 역할 변경 ──────────────────────────────────────────────────────────────
  const handleRoleChange = async (profile: Profile): Promise<void> => {
    if (user?.id === profile.id) return
    const newRole: 'admin' | 'user' = profile.role === 'admin' ? 'user' : 'admin'
    setActionLoading(`role-${profile.id}`)
    setError(null)
    try {
      const { error: err } = await supabase.rpc('set_user_role', {
        target_user_id: profile.id,
        new_role: newRole,
      })
      if (err) throw err
      setSuccessMsg(`${profile.email} 역할이 ${newRole === 'admin' ? '관리자' : '일반사용자'}로 변경되었습니다.`)
      void fetchProfiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : '역할 변경 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  // ── 활성/비활성 토글 ───────────────────────────────────────────────────────
  const handleToggleActive = async (profile: Profile): Promise<void> => {
    if (user?.id === profile.id) return
    setActionLoading(`active-${profile.id}`)
    setError(null)
    try {
      const { error: err } = await supabase.rpc('toggle_user_active', {
        target_user_id: profile.id,
      })
      if (err) throw err
      setSuccessMsg(`${profile.email} 계정이 ${profile.is_active ? '비활성' : '활성'}화되었습니다.`)
      void fetchProfiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : '상태 변경 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(null)
    }
  }

  // ── 검색 ──────────────────────────────────────────────────────────────────
  const handleSearch = (): void => {
    setPage(1)
    setSearch(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleSearchReset = (): void => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
        <h2 className="adm-page-title">사용자 관리</h2>
        <p className="adm-page-subtitle">전체 회원 목록을 조회하고 역할·상태를 관리합니다.</p>
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

      {/* 검색 바 */}
      <div className="adm-toolbar">
        <div className="adm-search-group">
          <input
            className="adm-search-input"
            type="text"
            placeholder="이메일 검색..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="adm-btn adm-btn--primary" onClick={handleSearch}>검색</button>
          {search && (
            <button className="adm-btn adm-btn--ghost" onClick={handleSearchReset}>초기화</button>
          )}
        </div>
        <span className="adm-count-label">총 {total.toLocaleString()}명</span>
      </div>

      {/* 테이블 */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th adm-th--no">번호</th>
              <th className="adm-th">이메일</th>
              <th className="adm-th">역할</th>
              <th className="adm-th">상태</th>
              <th className="adm-th">가입일</th>
              <th className="adm-th adm-th--action">액션</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="adm-td adm-td--center">
                  <span className="adm-spinner" />
                  <span className="adm-loading-text">불러오는 중...</span>
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="adm-td adm-td--center adm-td--empty">
                  {search ? `"${search}" 검색 결과가 없습니다.` : '사용자가 없습니다.'}
                </td>
              </tr>
            ) : (
              profiles.map((profile, idx) => {
                const rowNo = (page - 1) * PAGE_SIZE + idx + 1
                const isSelf = user?.id === profile.id
                const isRoleLoading = actionLoading === `role-${profile.id}`
                const isActiveLoading = actionLoading === `active-${profile.id}`

                return (
                  <tr key={profile.id} className={`adm-tr ${isSelf ? 'adm-tr--self' : ''}`}>
                    <td className="adm-td adm-td--no">{rowNo}</td>
                    <td className="adm-td adm-td--email">
                      {profile.email}
                      {isSelf && <span className="adm-badge adm-badge--self">나</span>}
                    </td>
                    <td className="adm-td">
                      <span className={`adm-badge ${profile.role === 'admin' ? 'adm-badge--admin' : 'adm-badge--user'}`}>
                        {profile.role === 'admin' ? '관리자' : '일반사용자'}
                      </span>
                    </td>
                    <td className="adm-td">
                      <span className={`adm-badge ${profile.is_active ? 'adm-badge--active' : 'adm-badge--inactive'}`}>
                        {profile.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="adm-td adm-td--date">{fmtDate(profile.created_at)}</td>
                    <td className="adm-td adm-td--action">
                      <div className="adm-action-group">
                        <button
                          className="adm-btn adm-btn--sm adm-btn--outline"
                          disabled={isSelf || isRoleLoading}
                          onClick={() => void handleRoleChange(profile)}
                          title={isSelf ? '본인 역할은 변경할 수 없습니다.' : undefined}
                        >
                          {isRoleLoading
                            ? '변경 중...'
                            : profile.role === 'admin'
                            ? '일반으로 변경'
                            : '관리자로 변경'}
                        </button>
                        <button
                          className={`adm-btn adm-btn--sm ${profile.is_active ? 'adm-btn--danger' : 'adm-btn--success'}`}
                          disabled={isSelf || isActiveLoading}
                          onClick={() => void handleToggleActive(profile)}
                          title={isSelf ? '본인 계정은 변경할 수 없습니다.' : undefined}
                        >
                          {isActiveLoading
                            ? '변경 중...'
                            : profile.is_active
                            ? '비활성화'
                            : '활성화'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="adm-pagination">
          <button
            className="adm-pag-btn"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            «
          </button>
          <button
            className="adm-pag-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis')
              acc.push(p)
              return acc
            }, [])
            .map((item, i) =>
              item === 'ellipsis' ? (
                <span key={`ell-${i}`} className="adm-pag-ellipsis">…</span>
              ) : (
                <button
                  key={item}
                  className={`adm-pag-btn ${page === item ? 'adm-pag-btn--active' : ''}`}
                  onClick={() => setPage(item as number)}
                >
                  {item}
                </button>
              )
            )}
          <button
            className="adm-pag-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            ›
          </button>
          <button
            className="adm-pag-btn"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            »
          </button>
        </div>
      )}
    </div>
  )
}
