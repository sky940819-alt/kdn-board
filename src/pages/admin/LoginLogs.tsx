import { type ReactElement, useEffect, useState, useCallback, useMemo } from 'react'
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

// Profile, ActivityLog 는 이 파일에서 직접 사용하지 않지만 공통 타입 정의 요건에 따라 포함
void (null as unknown as Profile)
void (null as unknown as ActivityLog)

// ── 상수 ────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20

type ActionFilter = 'all' | 'login' | 'logout' | 'failed'
type DateRange = 'today' | '7days' | '30days' | 'all'

// ── 날짜 포맷 ────────────────────────────────────────────────────────────────
function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}.${mo}.${day} ${h}:${mi}:${s}`
}

function getDateFrom(range: DateRange): string | null {
  if (range === 'all') return null
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  if (range === '7days') d.setDate(d.getDate() - 6)
  else if (range === '30days') d.setDate(d.getDate() - 29)
  return d.toISOString()
}

function getTodayStart(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// ── 통계 타입 ────────────────────────────────────────────────────────────────
type Stats = {
  todayLogin: number
  todayFailed: number
  totalCount: number
}

export default function LoginLogs(): ReactElement {
  // useAuth 는 관리자 인증 컨텍스트를 위해 import — 필요 시 확장 사용
  const { user: _currentUser } = useAuth()
  void _currentUser

  const [logs, setLogs] = useState<LoginLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 필터
  const [emailInput, setEmailInput] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')

  // 통계
  const [stats, setStats] = useState<Stats>({ todayLogin: 0, todayFailed: 0, totalCount: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  // ── 통계 로드 ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true)
    try {
      const todayStart = getTodayStart()

      const [loginRes, failedRes, totalRes] = await Promise.all([
        supabase
          .from('login_logs')
          .select('id', { count: 'exact', head: true })
          .eq('action', 'login')
          .gte('created_at', todayStart),
        supabase
          .from('login_logs')
          .select('id', { count: 'exact', head: true })
          .eq('action', 'failed')
          .gte('created_at', todayStart),
        supabase
          .from('login_logs')
          .select('id', { count: 'exact', head: true }),
      ])

      setStats({
        todayLogin: loginRes.count ?? 0,
        todayFailed: failedRes.count ?? 0,
        totalCount: totalRes.count ?? 0,
      })
    } catch {
      // 통계 로드 실패는 무시
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // ── 로그 로드 ──────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('login_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (emailFilter.trim()) {
        query = query.ilike('email', `%${emailFilter.trim()}%`)
      }
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter)
      }
      const dateFrom = getDateFrom(dateRange)
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }

      const { data, error: err, count } = await query
      if (err) throw err
      setLogs((data as LoginLog[]) ?? [])
      setTotal(count ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [page, emailFilter, actionFilter, dateRange])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  useEffect(() => {
    void fetchLogs()
  }, [fetchLogs])

  // ── 필터 적용 ──────────────────────────────────────────────────────────────
  const handleSearch = (): void => {
    setPage(1)
    setEmailFilter(emailInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = (): void => {
    setEmailInput('')
    setEmailFilter('')
    setActionFilter('all')
    setDateRange('all')
    setPage(1)
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  // ── 뱃지 색상 ──────────────────────────────────────────────────────────────
  function actionBadgeClass(action: LoginLog['action']): string {
    switch (action) {
      case 'login': return 'adm-badge adm-badge--login'
      case 'logout': return 'adm-badge adm-badge--logout'
      case 'failed': return 'adm-badge adm-badge--failed'
    }
  }

  function actionLabel(action: LoginLog['action']): string {
    switch (action) {
      case 'login': return '로그인'
      case 'logout': return '로그아웃'
      case 'failed': return '실패'
    }
  }

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h2 className="adm-page-title">로그인 로그</h2>
        <p className="adm-page-subtitle">사용자 로그인·로그아웃·실패 이력을 조회합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card adm-stat-card--login">
          <span className="adm-stat-card__label">오늘 로그인</span>
          <span className="adm-stat-card__value">
            {statsLoading ? '—' : stats.todayLogin.toLocaleString()}
          </span>
        </div>
        <div className="adm-stat-card adm-stat-card--failed">
          <span className="adm-stat-card__label">오늘 실패</span>
          <span className="adm-stat-card__value">
            {statsLoading ? '—' : stats.todayFailed.toLocaleString()}
          </span>
        </div>
        <div className="adm-stat-card">
          <span className="adm-stat-card__label">총 건수</span>
          <span className="adm-stat-card__value">
            {statsLoading ? '—' : stats.totalCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 필터 */}
      <div className="adm-filter-bar">
        <div className="adm-search-group">
          <input
            className="adm-search-input"
            type="text"
            placeholder="이메일 검색..."
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="adm-btn adm-btn--primary" onClick={handleSearch}>검색</button>
        </div>

        <select
          className="adm-select"
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value as ActionFilter); setPage(1) }}
        >
          <option value="all">전체 유형</option>
          <option value="login">로그인</option>
          <option value="logout">로그아웃</option>
          <option value="failed">실패</option>
        </select>

        <select
          className="adm-select"
          value={dateRange}
          onChange={e => { setDateRange(e.target.value as DateRange); setPage(1) }}
        >
          <option value="today">오늘</option>
          <option value="7days">최근 7일</option>
          <option value="30days">최근 30일</option>
          <option value="all">전체</option>
        </select>

        {(emailFilter || actionFilter !== 'all' || dateRange !== 'all') && (
          <button className="adm-btn adm-btn--ghost" onClick={handleReset}>필터 초기화</button>
        )}

        <span className="adm-count-label">총 {total.toLocaleString()}건</span>
      </div>

      {/* 오류 */}
      {error && (
        <div className="adm-alert adm-alert--error">
          <span>{error}</span>
          <button className="adm-alert__close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* 테이블 */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-th adm-th--no">번호</th>
              <th className="adm-th">시간</th>
              <th className="adm-th">이메일</th>
              <th className="adm-th">유형</th>
              <th className="adm-th">IP 주소</th>
              <th className="adm-th adm-th--browser">브라우저</th>
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
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="adm-td adm-td--center adm-td--empty">
                  조회된 로그가 없습니다.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => {
                const rowNo = total - (page - 1) * PAGE_SIZE - idx
                const ua = log.user_agent
                  ? log.user_agent.length > 60
                    ? log.user_agent.slice(0, 60) + '…'
                    : log.user_agent
                  : '—'
                return (
                  <tr key={log.id} className="adm-tr">
                    <td className="adm-td adm-td--no">{rowNo}</td>
                    <td className="adm-td adm-td--datetime">{fmtDateTime(log.created_at)}</td>
                    <td className="adm-td adm-td--email">{log.email}</td>
                    <td className="adm-td">
                      <span className={actionBadgeClass(log.action)}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="adm-td adm-td--ip">{log.ip_address ?? '—'}</td>
                    <td className="adm-td adm-td--browser adm-td--truncate" title={log.user_agent ?? undefined}>
                      {ua}
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
