/**
 * 첨부파일 업로드 · 다운로드 통합 테스트
 * 사용법: node scripts/test-attachment.mjs
 *
 * 테스트 순서:
 *  1) 테스트 게시물 작성
 *  2) Storage에 파일 직접 업로드
 *  3) attachments 테이블에 메타데이터 등록
 *  4) 게시물 상세 조회 → 첨부파일 목록 확인
 *  5) Storage에서 파일 다운로드 (Blob 검증)
 *  6) 테스트 데이터 전체 정리
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envText = readFileSync(join(__dir, '..', '.env'), 'utf8')
const get = key => envText.match(new RegExp(`^${key}=(.+)`, 'm'))?.[1]?.trim()

const BASE    = get('VITE_SUPABASE_URL')
const ANON    = get('VITE_SUPABASE_ANON_KEY')
const SERVICE = get('VITE_SUPABASE_SERVICE_KEY') ?? ANON

const ah = (key) => ({
  'apikey':        key,
  'Authorization': `Bearer ${key}`,
  'Content-Type':  'application/json',
})

let pass = 0, fail = 0
const ok  = (msg) => { console.log(`  ✅ ${msg}`); pass++ }
const err = (msg) => { console.error(`  ❌ ${msg}`); fail++ }

async function rest(method, path, body, key = ANON) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, {
    method,
    headers: { ...ah(key), 'Prefer': method === 'POST' ? 'return=representation' : '' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const txt = await r.text()
  try { return { ok: r.ok, status: r.status, data: JSON.parse(txt) }
  } catch { return { ok: r.ok, status: r.status, data: txt } }
}

// ── 1. 테스트 게시물 생성
console.log('\n📝 Step 1: 테스트 게시물 생성')
const postRes = await rest('POST', 'posts', {
  title:    '[테스트] 파일첨부 테스트 게시물',
  author:   '테스트봇',
  password: 'testpw99',
  content:  '첨부파일 업로드·다운로드 자동 테스트입니다.',
  views:    0,
})
if (!postRes.ok || !postRes.data?.[0]?.id) {
  err('게시물 생성 실패: ' + JSON.stringify(postRes.data))
  process.exit(1)
}
const pid = postRes.data[0].id
ok(`게시물 생성 성공 (id: ${pid})`)

// ── 2. Storage 업로드
console.log('\n📤 Step 2: Storage 파일 업로드')
const TEST_CONTENT = `한전KDN 자유게시판 첨부파일 테스트\n생성시각: ${new Date().toISOString()}\n`
const filepath     = `${pid}/${Date.now()}_test.txt`

const upRes = await fetch(`${BASE}/storage/v1/object/board-attachments/${filepath}`, {
  method:  'POST',
  headers: { 'apikey': SERVICE, 'Authorization': `Bearer ${SERVICE}`, 'Content-Type': 'text/plain' },
  body:    TEST_CONTENT,
})
const upJson = await upRes.json()
if (upRes.ok) {
  ok(`파일 업로드 성공 (path: ${filepath})`)
} else {
  err('파일 업로드 실패: ' + JSON.stringify(upJson))
  // 정리 후 종료
  await rest('DELETE', `posts?id=eq.${pid}`, null)
  process.exit(1)
}

// ── 3. attachments 테이블에 메타데이터 등록
console.log('\n🗂  Step 3: attachments 테이블 메타데이터 등록')
const attRes = await rest('POST', 'attachments', {
  post_id:  pid,
  filename: 'test-file.txt',
  filepath: filepath,
  filesize: Buffer.byteLength(TEST_CONTENT, 'utf8'),
  mimetype: 'text/plain',
})
if (!attRes.ok || !attRes.data?.[0]?.id) {
  err('attachments 등록 실패: ' + JSON.stringify(attRes.data))
} else {
  const aid = attRes.data[0].id
  ok(`attachments 등록 성공 (id: ${aid})`)

  // ── 4. 첨부파일 목록 조회
  console.log('\n📋 Step 4: 첨부파일 목록 조회')
  const listRes = await rest('GET', `attachments?post_id=eq.${pid}&select=*`)
  if (listRes.ok && listRes.data?.length > 0) {
    ok(`첨부파일 ${listRes.data.length}개 조회 성공: ${listRes.data[0].filename}`)
  } else {
    err('첨부파일 조회 실패: ' + JSON.stringify(listRes.data))
  }

  // ── 5. 파일 다운로드
  console.log('\n📥 Step 5: Storage 파일 다운로드')
  const dlRes = await fetch(`${BASE}/storage/v1/object/board-attachments/${filepath}`, {
    headers: { 'apikey': ANON, 'Authorization': `Bearer ${ANON}` },
  })
  if (dlRes.ok) {
    const text = await dlRes.text()
    if (text === TEST_CONTENT) {
      ok('다운로드 내용 검증 성공 (원본과 일치)')
    } else {
      err('다운로드 내용 불일치')
    }
  } else {
    err('다운로드 실패 HTTP ' + dlRes.status)
  }
}

// ── 6. 전체 정리
console.log('\n🗑  Step 6: 테스트 데이터 정리')
// Storage 파일 삭제
const rmRes = await fetch(`${BASE}/storage/v1/object/board-attachments`, {
  method:  'DELETE',
  headers: { ...ah(SERVICE), 'Content-Type': 'application/json' },
  body:    JSON.stringify({ prefixes: [filepath] }),
})
if (rmRes.ok) ok('Storage 파일 삭제 성공')
else err('Storage 파일 삭제 실패: ' + await rmRes.text())

// posts 삭제 (CASCADE → attachments 자동 삭제)
const delRes = await fetch(`${BASE}/rest/v1/posts?id=eq.${pid}`, {
  method:  'DELETE',
  headers: ah(ANON),
})
if (delRes.ok) ok('게시물(+첨부파일 메타) 삭제 성공')
else err('게시물 삭제 실패')

// ── 결과
console.log(`\n${'─'.repeat(50)}`)
console.log(`결과: ✅ ${pass}개 통과 / ❌ ${fail}개 실패`)
if (fail > 0) process.exit(1)
