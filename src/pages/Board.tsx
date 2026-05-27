import {
  useState, useEffect, useRef,
  type ReactElement, type DragEvent as RDE, type ChangeEvent, type FormEvent,
} from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
type Post = {
  id: string
  title: string
  author: string
  password: string
  content: string
  views: number
  created_at: string
  updated_at: string
}
type Attachment = {
  id: string
  post_id: string
  filename: string
  filepath: string
  filesize: number
  mimetype: string | null
  created_at: string
}
type PendingFile = { uid: string; file: File }
type View =
  | { m: 'list' }
  | { m: 'detail'; id: string }
  | { m: 'write' }
  | { m: 'edit'; id: string }

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const PER_PAGE = 10
const BUCKET   = 'board-attachments'

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const fmtSize = (b: number) =>
  b < 1024 ? `${b}B`
  : b < 1048576 ? `${(b / 1024).toFixed(1)}KB`
  : `${(b / 1048576).toFixed(1)}MB`

const fmtDateTime = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const fileIcon = (mime: string | null): string => {
  if (!mime) return '📄'
  if (mime.startsWith('image/')) return '🖼️'
  if (mime.includes('pdf')) return '📕'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('excel') || mime.includes('sheet') || mime.includes('csv')) return '📊'
  if (mime.includes('zip') || mime.includes('compressed') || mime.includes('rar')) return '🗜️'
  if (mime.startsWith('video/')) return '🎥'
  if (mime.startsWith('audio/')) return '🎵'
  if (mime.includes('text')) return '📃'
  return '📄'
}

// ─────────────────────────────────────────────────────────────
//  Spinner
// ─────────────────────────────────────────────────────────────
const Spinner = (): ReactElement => (
  <div className="bd-spinner"><div className="bd-spin-ring" /></div>
)

// ─────────────────────────────────────────────────────────────
//  FileDropZone
// ─────────────────────────────────────────────────────────────
type FDZProps = { files: PendingFile[]; onChange(f: PendingFile[]): void }

const FileDropZone = ({ files, onChange }: FDZProps): ReactElement => {
  const [over, setOver] = useState(false)
  const cnt = useRef(0)
  const inp = useRef<HTMLInputElement>(null)

  const addFiles = (raw: File[]) => {
    const ok: File[] = []
    const bad: string[] = []
    raw.forEach(f => (f.size > 10 * 1048576 ? bad.push(f.name) : ok.push(f)))
    if (bad.length) alert(`10MB 초과 파일은 추가할 수 없습니다:\n${bad.join('\n')}`)
    if (ok.length) onChange([...files, ...ok.map(f => ({ uid: crypto.randomUUID(), file: f }))])
  }

  const onDragEnter = (e: RDE<HTMLDivElement>) => { e.preventDefault(); cnt.current++; setOver(true) }
  const onDragOver  = (e: RDE<HTMLDivElement>) => { e.preventDefault() }
  const onDragLeave = (e: RDE<HTMLDivElement>) => { e.preventDefault(); if (!--cnt.current) setOver(false) }
  const onDrop = (e: RDE<HTMLDivElement>) => {
    e.preventDefault(); cnt.current = 0; setOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }
  const onBrowse = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { addFiles(Array.from(e.target.files)); e.target.value = '' }
  }
  const remove = (uid: string) => onChange(files.filter(f => f.uid !== uid))

  return (
    <div className="fz-wrap">
      {/* 드롭 영역 */}
      <div
        className={`fz-zone${over ? ' fz-zone--over' : ''}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <svg className="fz-cloud-icon" width="52" height="40" viewBox="0 0 52 40" fill="none">
          <path
            d="M38 16.5a11 11 0 0 0-22 0v.5A8 8 0 0 0 8 25a8 8 0 0 0 8 8h20a8 8 0 0 0 8-8 8 8 0 0 0-6-7.75z"
            fill="var(--kdn-red-100)" stroke="var(--kdn-red-400)" strokeWidth="1.4"
          />
          <path
            d="M26 23v10M22 27l4-4 4 4"
            stroke="var(--kdn-red-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <p className="fz-lead">파일을 여기에 드래그하세요</p>
        <span className="fz-or">또는</span>
        <button
          type="button"
          className="fz-browse-btn"
          onClick={() => inp.current?.click()}
        >
          📂 파일 찾아보기
        </button>
        <p className="fz-hint">최대 10MB · 여러 파일 동시 업로드 가능</p>
        <input ref={inp} type="file" multiple hidden onChange={onBrowse} />
      </div>

      {/* 첨부 예정 파일 목록 */}
      {files.length > 0 && (
        <ul className="pf-list">
          {files.map(({ uid, file }) => (
            <li className="pf-item" key={uid}>
              <span className="pf-ico">{fileIcon(file.type || null)}</span>
              <span className="pf-name">{file.name}</span>
              <span className="pf-size">{fmtSize(file.size)}</span>
              <button type="button" className="pf-del" title="제거" onClick={() => remove(uid)}>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Password Modal
// ─────────────────────────────────────────────────────────────
type PwModalProps = {
  action: '수정' | '삭제'
  onConfirm(pw: string): void
  onClose(): void
}
const PwModal = ({ action, onConfirm, onClose }: PwModalProps): ReactElement => {
  const [pw, setPw] = useState('')
  return (
    <div className="bd-modal-bg" onClick={onClose}>
      <div className="bd-modal" onClick={e => e.stopPropagation()}>
        <div className="bd-modal-icon">{action === '삭제' ? '🗑️' : '✏️'}</div>
        <h3 className="bd-modal-title">비밀번호 확인</h3>
        <p className="bd-modal-desc">
          게시물을 {action}하려면 작성 시 설정한 비밀번호를 입력하세요.
        </p>
        <input
          type="password"
          className="bd-modal-input"
          placeholder="비밀번호"
          value={pw}
          autoFocus
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirm(pw)}
        />
        <div className="bd-modal-btns">
          <button className="btn btn-outline" onClick={onClose}>취소</button>
          <button
            className="btn btn-primary"
            style={{ background: action === '삭제' ? '#dc2626' : undefined }}
            onClick={() => onConfirm(pw)}
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BoardList
// ─────────────────────────────────────────────────────────────
type BLProps = { onSelect(id: string): void; onWrite(): void }

const BoardList = ({ onSelect, onWrite }: BLProps): ReactElement => {
  const [posts, setPosts]         = useState<Post[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [keyword, setKeyword]     = useState('')
  const [inputKw, setInputKw]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [attMap, setAttMap]       = useState<Record<string, number>>({})

  const load = async (p: number, kw: string) => {
    setLoading(true)
    const from = (p - 1) * PER_PAGE
    let q = supabase
      .from('posts')
      .select('*', { count: 'exact' })
    if (kw.trim())
      q = q.or(`title.ilike.%${kw}%,content.ilike.%${kw}%,author.ilike.%${kw}%`)
    const { data, count, error } = await q
      .order('created_at', { ascending: false })
      .range(from, from + PER_PAGE - 1)

    if (!error && data) {
      setPosts(data as Post[])
      setTotal(count ?? 0)

      if (data.length) {
        const ids = (data as Post[]).map(r => r.id)
        const { data: ad } = await supabase
          .from('attachments')
          .select('post_id')
          .in('post_id', ids)
        const m: Record<string, number> = {}
        ad?.forEach(a => { m[a.post_id] = (m[a.post_id] ?? 0) + 1 })
        setAttMap(m)
      } else {
        setAttMap({})
      }
    }
    setLoading(false)
  }

  useEffect(() => { load(page, keyword) }, [page, keyword])

  const doSearch = () => { setPage(1); setKeyword(inputKw) }
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // 페이지 번호 범위 계산
  const pageNums = (() => {
    const half = 2
    let s = Math.max(1, page - half)
    const e = Math.min(totalPages, s + 4)
    s = Math.max(1, e - 4)
    const ns: number[] = []
    for (let i = s; i <= e; i++) ns.push(i)
    return ns
  })()

  return (
    <div className="bd-list">
      {/* 상단 툴바 */}
      <div className="bd-toolbar">
        <span className="bd-total">
          전체 <strong>{total.toLocaleString()}</strong>건
        </span>
        <div className="bd-toolbar-right">
          <div className="bd-search-box">
            <svg className="bd-search-ico" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="bd-search-inp"
              placeholder="제목 · 내용 · 작성자 검색"
              value={inputKw}
              onChange={e => setInputKw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            <button className="bd-search-btn" onClick={doSearch}>검색</button>
          </div>
          <button className="btn btn-primary bd-write-btn" onClick={onWrite}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            글쓰기
          </button>
        </div>
      </div>

      {/* 테이블 */}
      {loading ? <Spinner /> : (
        <div className="bd-table-wrap">
          <table className="bd-table">
            <colgroup>
              <col style={{ width: '60px' }} />
              <col />
              <col style={{ width: '90px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '46px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>번호</th>
                <th className="bd-th-left">제목</th>
                <th>작성자</th>
                <th>등록일</th>
                <th>조회</th>
                <th>첨부</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="bd-empty-cell">
                      <span>📭</span>
                      <p>{keyword ? `'${keyword}'에 대한 검색 결과가 없습니다.` : '등록된 게시물이 없습니다.'}</p>
                      {keyword && (
                        <button className="btn btn-outline" style={{ fontSize: '13px', padding: '7px 16px' }}
                          onClick={() => { setInputKw(''); setKeyword('') }}>
                          전체 보기
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : posts.map((post, i) => {
                const num  = total - (page - 1) * PER_PAGE - i
                const cnt2 = attMap[post.id] ?? 0
                return (
                  <tr key={post.id} className="bd-row" onClick={() => onSelect(post.id)}>
                    <td className="bd-td-center bd-td-num">{num}</td>
                    <td className="bd-td-title">
                      <span className="bd-title-link">{post.title}</span>
                      {cnt2 > 0 && (
                        <span className="bd-att-chip">
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M9 5.5L5.5 9A3.5 3.5 0 0 1 .5 5V4A3.5 3.5 0 0 1 7 4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          </svg>
                          {cnt2}
                        </span>
                      )}
                    </td>
                    <td className="bd-td-center">{post.author}</td>
                    <td className="bd-td-center bd-td-date">{fmtDate(post.created_at)}</td>
                    <td className="bd-td-center bd-td-views">{post.views.toLocaleString()}</td>
                    <td className="bd-td-center">
                      {cnt2 > 0 && <span className="bd-att-dot" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <div className="bd-paging">
          <button className="bd-pg" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="bd-pg" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {pageNums.map(n => (
            <button key={n} className={`bd-pg${n === page ? ' bd-pg--on' : ''}`} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
          <button className="bd-pg" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button className="bd-pg" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BoardDetail
// ─────────────────────────────────────────────────────────────
type BDProps = { id: string; onBack(): void; onEdit(id: string): void }

const BoardDetail = ({ id, onBack, onEdit }: BDProps): ReactElement => {
  const [post, setPost]             = useState<Post | null>(null)
  const [atts, setAtts]             = useState<Attachment[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState<'edit' | 'delete' | null>(null)
  const [dlId, setDlId]             = useState<string | null>(null)
  const [errMsg, setErrMsg]         = useState('')

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('posts').select('*').eq('id', id).single(),
        supabase.from('attachments').select('*').eq('post_id', id).order('created_at'),
      ])
      if (p) {
        setPost(p as Post)
        // 조회수 증가 (백그라운드)
        supabase.rpc('increment_views', { pid: id }).then(() => {
          setPost(prev => prev ? { ...prev, views: prev.views + 1 } : prev)
        })
      }
      if (a) setAtts(a as Attachment[])
      setLoading(false)
    }
    init()
  }, [id])

  const handlePw = async (pw: string) => {
    if (!post) return
    if (pw !== post.password) { setErrMsg('비밀번호가 일치하지 않습니다.'); return }
    setModal(null); setErrMsg('')
    if (modal === 'edit') {
      onEdit(id)
    } else if (modal === 'delete') {
      if (atts.length)
        await supabase.storage.from(BUCKET).remove(atts.map(a => a.filepath))
      await supabase.from('posts').delete().eq('id', id)
      onBack()
    }
  }

  const download = async (att: Attachment) => {
    setDlId(att.id)
    const { data, error } = await supabase.storage.from(BUCKET).download(att.filepath)
    if (data && !error) {
      const url = URL.createObjectURL(data)
      Object.assign(document.createElement('a'), { href: url, download: att.filename }).click()
      URL.revokeObjectURL(url)
    } else {
      alert('다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
    setDlId(null)
  }

  if (loading) return <Spinner />
  if (!post) return (
    <div className="bd-notfound">
      <p>게시물을 찾을 수 없습니다.</p>
      <button className="btn btn-outline" onClick={onBack}>목록으로</button>
    </div>
  )

  return (
    <div className="bd-detail">
      {/* 뒤로가기 */}
      <button className="bd-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        목록으로
      </button>

      {/* 제목 + 메타 */}
      <div className="bd-detail-head">
        <h2 className="bd-detail-ttl">{post.title}</h2>
        <div className="bd-detail-meta">
          <span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 12c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {post.author}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M1 5h11M4 1v2M9 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {fmtDateTime(post.created_at)}
          </span>
          <span>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 6.5C1 6.5 3.5 2 6.5 2S12 6.5 12 6.5 9.5 11 6.5 11 1 6.5 1 6.5z" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            조회 {post.views.toLocaleString()}
          </span>
          {post.updated_at !== post.created_at && (
            <span className="bd-edited-chip">수정됨 {fmtDate(post.updated_at)}</span>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="bd-detail-body">
        {post.content.split('\n').map((line, i) =>
          line ? <p key={i}>{line}</p> : <br key={i} />
        )}
      </div>

      {/* 첨부파일 */}
      {atts.length > 0 && (
        <div className="bd-att-area">
          <div className="bd-att-head">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 7L7.5 11.5A4 4 0 0 1 2 7V5.5A4 4 0 0 1 9 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            첨부파일 ({atts.length})
          </div>
          <ul className="bd-att-list">
            {atts.map(att => (
              <li key={att.id} className="bd-att-row">
                <span className="bd-att-ico">{fileIcon(att.mimetype)}</span>
                <span className="bd-att-name">{att.filename}</span>
                <span className="bd-att-sz">{fmtSize(att.filesize)}</span>
                <button
                  className="bd-att-dl"
                  disabled={dlId === att.id}
                  onClick={() => download(att)}
                >
                  {dlId === att.id
                    ? <span className="bd-dl-loading">다운로드 중…</span>
                    : <>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M6.5 1v8M3 6l3.5 3.5L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M1 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        다운로드
                      </>
                  }
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 에러 메시지 */}
      {errMsg && <div className="bd-pw-err">⚠️ {errMsg}</div>}

      {/* 하단 버튼 */}
      <div className="bd-detail-foot">
        <button className="btn btn-outline" onClick={onBack}>목록</button>
        <div className="bd-detail-foot-right">
          <button className="bd-edit-btn" onClick={() => { setErrMsg(''); setModal('edit') }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            수정
          </button>
          <button className="bd-del-btn" onClick={() => { setErrMsg(''); setModal('delete') }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M5 4V2h4v2M11 4l-.9 8H3.9L3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            삭제
          </button>
        </div>
      </div>

      {/* 비밀번호 모달 */}
      {modal && (
        <PwModal
          action={modal === 'edit' ? '수정' : '삭제'}
          onConfirm={handlePw}
          onClose={() => { setModal(null); setErrMsg('') }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BoardForm  (write / edit)
// ─────────────────────────────────────────────────────────────
type BFProps = {
  mode: 'write' | 'edit'
  postId?: string
  onDone(): void
  onCancel(): void
}

const BoardForm = ({ mode, postId, onDone, onCancel }: BFProps): ReactElement => {
  const [title,     setTitle]     = useState('')
  const [author,    setAuthor]    = useState('익명')
  const [password,  setPassword]  = useState('')
  const [content,   setContent]   = useState('')
  const [files,     setFiles]     = useState<PendingFile[]>([])
  const [existAtts, setExistAtts] = useState<Attachment[]>([])
  const [removedIds,setRemovedIds]= useState<string[]>([])
  const [loading,   setLoading]   = useState(mode === 'edit')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [progress,  setProgress]  = useState('')

  useEffect(() => {
    if (mode !== 'edit' || !postId) return
    const init = async () => {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('posts').select('*').eq('id', postId).single(),
        supabase.from('attachments').select('*').eq('post_id', postId).order('created_at'),
      ])
      if (p) {
        const post = p as Post
        setTitle(post.title)
        setAuthor(post.author)
        setPassword(post.password)
        setContent(post.content)
      }
      if (a) setExistAtts(a as Attachment[])
      setLoading(false)
    }
    init()
  }, [mode, postId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!title.trim())   { setError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }
    if (!password)       { setError('비밀번호를 입력해주세요.'); return }

    setSaving(true)
    try {
      let pid = postId ?? ''

      // ── 게시물 저장/수정 ──
      if (mode === 'write') {
        setProgress('게시물 등록 중…')
        const { data, error: e } = await supabase
          .from('posts')
          .insert({
            title:   title.trim(),
            author:  author.trim() || '익명',
            password,
            content: content.trim(),
            views:   0,
          })
          .select('id')
          .single()
        if (e || !data) throw new Error(e?.message ?? '게시물 저장 실패')
        pid = data.id
      } else {
        setProgress('게시물 수정 중…')
        await supabase
          .from('posts')
          .update({
            title:      title.trim(),
            author:     author.trim() || '익명',
            content:    content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', pid)
      }

      // ── 기존 첨부파일 삭제 ──
      if (removedIds.length) {
        setProgress('기존 첨부파일 제거 중…')
        const toRemove = existAtts.filter(a => removedIds.includes(a.id))
        if (toRemove.length)
          await supabase.storage.from(BUCKET).remove(toRemove.map(a => a.filepath))
        await supabase.from('attachments').delete().in('id', removedIds)
      }

      // ── 신규 파일 업로드 ──
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i]
        setProgress(`파일 업로드 중 (${i + 1}/${files.length}): ${file.name}`)
        const ext  = file.name.includes('.') ? file.name.split('.').pop() : ''
        const path = `${pid}/${Date.now()}_${Math.random().toString(36).slice(2)}${ext ? `.${ext}` : ''}`
        const { error: ue } = await supabase.storage.from(BUCKET).upload(path, file)
        if (!ue) {
          await supabase.from('attachments').insert({
            post_id:  pid,
            filename: file.name,
            filepath: path,
            filesize: file.size,
            mimetype: file.type || null,
          })
        }
      }

      setProgress('')
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
      setProgress('')
    }
  }

  if (loading) return <Spinner />

  return (
    <form className="bd-form" onSubmit={handleSubmit} noValidate>
      <div className="bd-form-hd">
        <h2 className="bd-form-title">
          {mode === 'write' ? '✏️ 새 글쓰기' : '📝 게시물 수정'}
        </h2>
        <p className="bd-form-sub">
          <span className="bd-req-mark">*</span> 표시는 필수 입력 항목입니다.
        </p>
      </div>

      {error && <div className="bd-form-err">⚠️ {error}</div>}

      {/* 제목 */}
      <div className="bd-field">
        <label className="bd-lbl">제목 <span className="bd-req-mark">*</span></label>
        <input
          className="bd-inp"
          placeholder="제목을 입력하세요 (최대 200자)"
          value={title}
          maxLength={200}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* 작성자 + 비밀번호 */}
      <div className="bd-field-row">
        <div className="bd-field">
          <label className="bd-lbl">작성자</label>
          <input
            className="bd-inp"
            placeholder="익명"
            value={author}
            maxLength={50}
            onChange={e => setAuthor(e.target.value)}
          />
        </div>
        <div className="bd-field">
          <label className="bd-lbl">
            비밀번호 <span className="bd-req-mark">*</span>
            {mode === 'edit' && <span className="bd-lbl-hint"> (수정·삭제 시 사용)</span>}
          </label>
          <input
            className="bd-inp"
            type={mode === 'write' ? 'password' : 'text'}
            readOnly={mode === 'edit'}
            placeholder={mode === 'write' ? '수정/삭제 시 필요합니다' : ''}
            value={password}
            onChange={mode === 'write' ? e => setPassword(e.target.value) : undefined}
          />
        </div>
      </div>

      {/* 내용 */}
      <div className="bd-field">
        <label className="bd-lbl">내용 <span className="bd-req-mark">*</span></label>
        <textarea
          className="bd-txta"
          placeholder="내용을 입력하세요"
          value={content}
          rows={14}
          onChange={e => setContent(e.target.value)}
        />
        <div className="bd-txta-count">{content.length.toLocaleString()}자</div>
      </div>

      {/* 기존 첨부파일 (수정 모드) */}
      {mode === 'edit' && existAtts.length > 0 && (
        <div className="bd-field">
          <label className="bd-lbl">기존 첨부파일</label>
          <ul className="pf-list">
            {existAtts.filter(a => !removedIds.includes(a.id)).map(att => (
              <li className="pf-item pf-item--exist" key={att.id}>
                <span className="pf-ico">{fileIcon(att.mimetype)}</span>
                <span className="pf-name">{att.filename}</span>
                <span className="pf-size">{fmtSize(att.filesize)}</span>
                <button
                  type="button" className="pf-del" title="삭제"
                  onClick={() => setRemovedIds(r => [...r, att.id])}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          {removedIds.length > 0 && (
            <p className="bd-removed-hint">
              🗑 삭제 예정: {removedIds.length}개 파일 (저장 시 완전 삭제됩니다)
            </p>
          )}
        </div>
      )}

      {/* 신규 첨부파일 */}
      <div className="bd-field">
        <label className="bd-lbl">
          {mode === 'edit' ? '파일 추가' : '첨부파일'}
        </label>
        <FileDropZone files={files} onChange={setFiles} />
      </div>

      {/* 진행 상태 */}
      {saving && progress && (
        <div className="bd-progress">
          <div className="bd-progress-bar">
            <div className="bd-progress-fill" />
          </div>
          <p className="bd-progress-txt">{progress}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="bd-form-foot">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? '저장 중…' : mode === 'write' ? '등록하기' : '수정 완료'}
        </button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────
//  Board  (진입점)
// ─────────────────────────────────────────────────────────────
const Board = (): ReactElement => {
  const [view, setView] = useState<View>({ m: 'list' })

  return (
    <>
      {/* 페이지 헤더 */}
      <section className="page-header-ed">
        <div className="container">
          <div className="eyebrow">Community · Free Board</div>
          <h1>자유게시판</h1>
          <p>자유롭게 의견을 나누고 소통하는 열린 공간입니다.</p>
        </div>
      </section>

      {/* 본문 */}
      <section className="section-ed">
        <div className="container bd-container">
          {view.m === 'list' && (
            <BoardList
              onSelect={id => setView({ m: 'detail', id })}
              onWrite={() => setView({ m: 'write' })}
            />
          )}
          {view.m === 'detail' && (
            <BoardDetail
              id={view.id}
              onBack={() => setView({ m: 'list' })}
              onEdit={id => setView({ m: 'edit', id })}
            />
          )}
          {view.m === 'write' && (
            <BoardForm
              mode="write"
              onDone={() => setView({ m: 'list' })}
              onCancel={() => setView({ m: 'list' })}
            />
          )}
          {view.m === 'edit' && (
            <BoardForm
              mode="edit"
              postId={view.id}
              onDone={() => setView({ m: 'detail', id: view.id })}
              onCancel={() => setView({ m: 'detail', id: view.id })}
            />
          )}
        </div>
      </section>
    </>
  )
}

export default Board
