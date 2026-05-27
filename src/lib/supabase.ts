import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경변수가 설정되지 않았습니다.\n' +
    '.env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 입력해주세요.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ── sessionStorage 사용 ────────────────────────────────────
    // localStorage 대신 sessionStorage를 쓰면:
    //   · 탭/브라우저를 닫으면 세션 즉시 소멸
    //   · 서버 재기동 후 브라우저 새로 열면 로그인 상태 초기화
    //   · 같은 탭 내 새로고침은 세션 유지 (정상 사용)
    storage:          typeof window !== 'undefined' ? window.sessionStorage : undefined,
    persistSession:   true,
    autoRefreshToken: true,
  },
})
