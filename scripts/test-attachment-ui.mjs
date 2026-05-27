/**
 * 첨부파일 UI 통합 테스트 (Playwright)
 * 파일 찾아보기 버튼으로 업로드 → 게시 → 상세 조회 → 다운로드 클릭 → 삭제
 */
import { chromium } from 'playwright'
import { writeFileSync, existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir   = dirname(fileURLToPath(import.meta.url))
const ssDir   = join(__dir, 'screenshots')
if (!existsSync(ssDir)) mkdirSync(ssDir, { recursive: true })

const BASE_URL = 'http://localhost:5174/kdn-board/board'
let  browser, page
let  pass = 0, fail = 0

const ok  = msg => { console.log(`  ✅ ${msg}`); pass++ }
const err = msg => { console.error(`  ❌ ${msg}`); fail++ }
const ss  = async name => { await page.screenshot({ path: join(ssDir, `att-${name}.png`), fullPage: false }) }

// 테스트용 임시 파일 생성
const TMP_FILE = join(__dir, 'test-upload.txt')
writeFileSync(TMP_FILE, `한전KDN 첨부파일 UI 테스트\n생성: ${new Date().toISOString()}\n`)

try {
  browser = await chromium.launch({ headless: true })
  page    = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 900 })

  // ── Step 1: 게시판 접속
  console.log('\n🌐 Step 1: 자유게시판 접속')
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.bd-list')
  await ss('01-list')
  ok('게시판 목록 로딩 성공')

  // ── Step 2: 글쓰기 클릭
  console.log('\n✏️  Step 2: 글쓰기')
  await page.click('.bd-write-btn')
  await page.waitForSelector('.bd-form')
  await ss('02-form')
  ok('글쓰기 폼 진입')

  // ── Step 3: 폼 입력
  console.log('\n📝 Step 3: 폼 입력')
  await page.fill('.bd-inp[placeholder*="제목"]', '[UI테스트] 파일 첨부 테스트')
  await page.fill('.bd-inp[placeholder="익명"]', '테스트봇')
  await page.fill('input[type="password"]', 'uiatt99')
  await page.fill('.bd-txta', '파일 첨부 UI 자동 테스트입니다.\n찾아보기 버튼을 사용해 파일을 선택합니다.')
  ok('제목·작성자·비밀번호·내용 입력')

  // ── Step 4: 파일 찾아보기로 첨부
  console.log('\n📎 Step 4: 파일 찾아보기 업로드')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(TMP_FILE)
  await page.waitForSelector('.pf-item')
  const fname = await page.textContent('.pf-name')
  ok(`파일 첨부 표시: ${fname?.trim()}`)
  await ss('03-file-attached')

  // ── Step 5: 등록하기
  console.log('\n🚀 Step 5: 등록하기')
  await page.click('button[type="submit"]')
  // 업로드 진행 텍스트 대기 (있을 수도 없을 수도)
  await page.waitForSelector('.bd-list', { timeout: 15000 })
  await ss('04-after-submit')
  ok('등록 완료 → 목록 복귀')

  // ── Step 6: 등록된 게시물 찾기 (맨 위 행 = 최신)
  console.log('\n🔍 Step 6: 등록된 게시물 확인')
  await page.waitForTimeout(500)
  const firstTitle = await page.textContent('.bd-table tbody tr:first-child .bd-title-link')
  if (firstTitle?.includes('UI테스트')) {
    ok(`최신 게시물 확인: ${firstTitle.trim()}`)
  } else {
    err(`예상과 다른 첫 행 제목: ${firstTitle}`)
  }

  // 첨부파일 클립 아이콘 확인
  const attChip = await page.$('.bd-table tbody tr:first-child .bd-att-chip')
  if (attChip) ok('목록에서 첨부파일 클립 아이콘 표시 확인')
  else err('첨부파일 클립 아이콘 없음')

  // ── Step 7: 상세 보기 진입
  console.log('\n📄 Step 7: 상세 보기')
  await page.click('.bd-table tbody tr:first-child')
  await page.waitForSelector('.bd-detail')
  await ss('05-detail')
  ok('상세 페이지 진입')

  // 첨부파일 영역 확인
  const attArea = await page.$('.bd-att-area')
  if (attArea) ok('첨부파일 영역 표시')
  else err('첨부파일 영역 없음')

  const attName = await page.textContent('.bd-att-name')
  ok(`첨부파일 이름: ${attName?.trim()}`)

  // ── Step 8: 다운로드 버튼 클릭
  console.log('\n📥 Step 8: 다운로드 클릭')
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }),
    page.click('.bd-att-dl'),
  ])
  const dlName = download.suggestedFilename()
  ok(`다운로드 시작: ${dlName}`)
  await ss('06-download')

  // ── Step 9: 삭제 (정리)
  console.log('\n🗑  Step 9: 게시물 삭제 (정리)')
  await page.click('.bd-del-btn')
  await page.waitForSelector('.bd-modal')
  await page.fill('.bd-modal-input', 'uiatt99')
  await page.click('.bd-modal-btns .btn-primary')
  await page.waitForSelector('.bd-list', { timeout: 8000 })
  await ss('07-deleted')
  ok('삭제 완료 → 목록 복귀')

  // 삭제됐는지 확인 (첫 행 제목이 바뀌어야 함)
  await page.waitForTimeout(500)
  const afterTitle = await page.textContent('.bd-table tbody tr:first-child .bd-title-link').catch(() => '')
  if (!afterTitle?.includes('UI테스트')) ok('삭제 검증 성공 (목록에서 제거됨)')
  else err('삭제 후에도 목록에 남아 있음')

} catch (e) {
  err(`예외 발생: ${e.message}`)
  if (page) await ss('error')
} finally {
  if (browser) await browser.close()
  if (existsSync(TMP_FILE)) unlinkSync(TMP_FILE)
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`결과: ✅ ${pass}개 통과 / ❌ ${fail}개 실패`)
  console.log(`스크린샷: scripts/screenshots/att-*.png`)
  if (fail > 0) process.exit(1)
}
