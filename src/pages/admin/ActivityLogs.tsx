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

// Profile, LoginLog 는 이 파일에서 직접 사용하지 않지만 공통 타입 정의 요건에 따라 포함
void (null as unknown as Profile)
void (null as unknown as LoginLog)

// ── 상수 ────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20

type ActionFilter = 'all' | 'post_create' | 'post_edit' | 'post_delete' | 'post_view'
type DateRange = 'today' | '7days' | '30days' | 'all'

const ACTION_LABELS: Record<string, string> = {
  post_create: '글 작성',
  post_edit: '글 수정',
  post_delete: '글 삭제',
  post_view: '글 조회',
  post_search: '검색',
}

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
  todayCreate: number
  todayEdit: number
  todayDelete: number
}

export default function ActivityLogs(): ReactElement {
  // useAuth 는 관리자 인증 컨텍스트를 위해 import — 필요 시 확장 사용
  const { user: _currentUser } = useAuth()
  void _currentUser

  const [logs, setLogs] = useState<ActivityLog[]>([])
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
  const [stats, setStats] = useState<Stats>({ todayCreate: 0, todayEdit: 0, todayDelete: 0 })
  const [statsLoading, setStatsLoading] = useState(false)

  // ── 통계 로드 ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true)
    try {
      const todayStart = getTodayStart()

      const [createRes, editRes, deleteRes] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true })
          .eq('action', 'post_create')
          .gte('created_at', todayStart),
        supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true })
          .eq('action', 'post_edit')
          .gte('created_at', todayStart),
        supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true })
          .eq('action', 'post_delete')
          .gte('created_at', todayStart),
      ])

      setStats({
        todayCreate: createRes.count ?? 0,
        todayEdit: editRes.count ?? 0,
        todayDelete: deleteRes.count ?? 0,
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
        .from('activity_logs')
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
      setLogs((data as ActivityLog[]) ?? [])
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

  // ── 활동 라벨 ──────────────────────────────────────────────────────────────
  function getActionLabel(action: string): string {
    return ACTION_LABELS[action] ?? action
  }

  function getActionBadgeClass(action: string): string {
    switch (action) {
      case 'post_create': return 'adm-badge adm-badge--create'
      case 'post_edit': return 'adm-badge adm-badge--edit'
      case 'post_delete': return 'adm-badge adm-badge--delete'
      case 'post_view': return 'adm-badge adm-badge--view'
      case 'post_search': return 'adm-badge adm-badge--search'
      default: return 'adm-badge adm-badge--default'
    }
  }

  // ── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h2 className="adm-page-title">활동 로그</h2>
        <p className="adm-page-subtitle">사용자 게시판 활동 이력을 조회합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card adm-stat-card--create">
          <span className="adm-stat-card__label">오늘 작성</span>
          <span className="adm-stat-card__value">
            {statsLoading ? '—' : stats.todayCreate.toLocaleString()}
          </span>
        </div>
        <div className="adm-stat-card adm-stat-card--edit">
          <span className="adm-stat-card__label">오늘 수정</span>
          <span className="adm-stat-card__value">
            {statsLoading ? '—' : stats.todayEdit.toLocaleString()}
          </span>
        </div>
        <div className="adm-stat-card adm-stat-card--delete">
          <span className="adm-stat-card__label">오늘 삭제</span>
          <span className="adm-stat-card__value">
            {statsLoading ? '—' : stats.todayDelete.toLocaleString()}
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
          <option value="all">전체 활동</option>
          <option value="post_create">글 작성</option>
          <option value="post_edit">글 수정</option>
          <option value="post_delete">글 삭제</option>
          <option value="post_view">글 조회</option>
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
              <th className="adm-th">활동</th>
              <th className="adm-th adm-th--title">게시물 제목</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="adm-td adm-td--center">
                  <span className="adm-spinner" />
                  <span className="adm-loading-text">불러오는 중...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="adm-td adm-td--center adm-td--empty">
                  조회된 활동 로그가 없습니다.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => {
                const rowNo = total - (page - 1) * PAGE_SIZE - idx
                return (
                  <tr key={log.id} className="adm-tr">
                    <td className="adm-td adm-td--no">{rowNo}</td>
                    <td className="adm-td adm-td--datetime">{fmtDateTime(log.created_at)}</td>
                    <td className="adm-td adm-td--email">{log.email}</td>
                    <td className="adm-td">
                      <span className={getActionBadgeClass(log.action)}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="adm-td adm-td--title">
                      {log.target_title ? (
                        <span className="adm-td__title-text" title={log.target_title}>
                          {log.target_title}
                        </span>
                      ) : (
                        <span className="adm-td__empty">—</span>
                      )}
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
