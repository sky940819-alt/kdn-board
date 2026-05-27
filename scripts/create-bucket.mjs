/**
 * Supabase Storage 버킷 생성 스크립트
 * 사용법: node scripts/create-bucket.mjs
 *
 * 요구사항: .env 파일에 VITE_SUPABASE_SERVICE_KEY=sb_secret_... 필요
 * (Supabase Dashboard > Settings > API > service_role key)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const envText = readFileSync(join(__dir, '..', '.env'), 'utf8')

const get = (key) => {
  const m = envText.match(new RegExp(`^${key}=(.+)`, 'm'))
  return m?.[1]?.trim()
}

const SUPABASE_URL      = get('VITE_SUPABASE_URL')
const SUPABASE_ANON_KEY = get('VITE_SUPABASE_ANON_KEY')
const SERVICE_KEY       = get('VITE_SUPABASE_SERVICE_KEY')

if (!SERVICE_KEY) {
  console.error('❌ .env 에 VITE_SUPABASE_SERVICE_KEY 가 없습니다.')
  console.error('   Supabase Dashboard > Settings > API > service_role 키를 추가하세요.')
  process.exit(1)
}

const headers = {
  'apikey':        SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type':  'application/json',
}

// 1) 버킷 존재 여부 확인
console.log('🔍 버킷 상태 확인 중…')
const listRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, { headers })
const buckets = await listRes.json()

if (buckets.find(b => b.id === 'board-attachments')) {
  console.log('✅ board-attachments 버킷이 이미 존재합니다.')
} else {
  // 2) 버킷 생성
  console.log('🪣 버킷 생성 중…')
  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      id:              'board-attachments',
      name:            'board-attachments',
      public:          true,
      file_size_limit: 10485760,
    }),
  })
  const createJson = await createRes.json()
  if (createRes.ok) {
    console.log('✅ 버킷 생성 성공:', createJson)
  } else {
    console.error('❌ 버킷 생성 실패:', createJson)
    process.exit(1)
  }
}

// 3) Storage RLS 정책 — service_role 은 RLS 우회하므로 anon key로 업로드 되려면 정책 필요
//    SQL Editor에서 이미 실행했다면 "already exists" 오류는 무시합니다.
console.log('')
console.log('📋 Storage RLS 정책을 Supabase SQL Editor에서 아직 실행하지 않았다면 실행하세요:')
console.log(`
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='board_att_select') THEN
    CREATE POLICY board_att_select ON storage.objects FOR SELECT USING (bucket_id = 'board-attachments');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='board_att_insert') THEN
    CREATE POLICY board_att_insert ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'board-attachments');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='board_att_delete') THEN
    CREATE POLICY board_att_delete ON storage.objects FOR DELETE USING (bucket_id = 'board-attachments');
  END IF;
END $$;
`)
console.log('✅ 완료! 이제 파일 업로드/다운로드 테스트를 진행하세요.')

// 4) 간단한 업로드 테스트
console.log('🧪 업로드 테스트 (작은 텍스트 파일)…')
const testContent = new Blob(['board-attachments bucket test ' + new Date().toISOString()], { type: 'text/plain' })
const testPath    = `_test/bucket-verify-${Date.now()}.txt`

const upRes = await fetch(`${SUPABASE_URL}/storage/v1/object/board-attachments/${testPath}`, {
  method:  'POST',
  headers: { ...headers, 'Content-Type': 'text/plain' },
  body:    testContent,
})
const upJson = await upRes.json()
if (upRes.ok) {
  console.log('✅ 업로드 성공:', upJson)
  // 정리
  await fetch(`${SUPABASE_URL}/storage/v1/object/board-attachments/${testPath}`, {
    method: 'DELETE', headers,
  })
  console.log('🗑  테스트 파일 삭제 완료')
} else {
  console.warn('⚠️  업로드 실패 (RLS 정책을 먼저 적용하세요):', upJson)
}
