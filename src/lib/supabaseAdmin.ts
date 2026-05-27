/**
 * Supabase Admin 클라이언트 (서버 수준 작업 전용)
 *
 * ⚠️  storageKey 를 분리해 기본 클라이언트(supabase.ts)의 세션과 충돌하지 않게 설정.
 *     persistSession / autoRefreshToken 을 false 로 두어 브라우저 저장소에 기록하지 않음.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string
const supabaseService = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string | undefined

export const supabaseAdmin = supabaseService
  ? createClient(supabaseUrl, supabaseService, {
      auth: {
        autoRefreshToken:   false,
        persistSession:     false,
        detectSessionInUrl: false,
        storageKey:         'sb-kdn-admin-token', // ← 기본 클라이언트와 키 분리
      },
    })
  : null
