import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ── Supabase Admin 클라이언트 ────────────────────────────────────────
// VITE_SUPABASE_SERVICE_KEY 가 설정된 경우에만 생성됩니다.
// 회원가입 직후 이메일 인증 대기 없이 즉시 로그인 처리에 사용됩니다.
//
// ⚠️  Service Key 는 RLS 를 우회하는 강력한 권한을 가집니다.
//     클라이언트 번들에 포함될 경우 보안 위험이 있으므로
//     프로덕션 환경에서는 서버 사이드(Edge Function 등)로 이전을 권장합니다.

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string | undefined
const supabaseService = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string | undefined

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseService
    ? createClient(supabaseUrl, supabaseService, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null
