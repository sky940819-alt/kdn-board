import { supabase } from './supabase'

// ── 활동 로그 테이블 명칭 ─────────────────────────────────────
// DB에 activity_logs 테이블이 없는 환경에서는 조용히 무시합니다.

/**
 * 게시판 활동 로그 (post_view / post_create / post_edit / post_delete)
 */
export const logActivity = async (
  userId: string,
  email: string,
  action: 'post_view' | 'post_create' | 'post_edit' | 'post_delete',
  postId: string,
  postTitle: string,
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      user_id:    userId,
      email,
      action,
      post_id:    postId,
      post_title: postTitle,
    })
  } catch {
    // 로그 실패가 메인 기능에 영향을 주지 않도록 silent catch
  }
}

/**
 * 로그인 / 로그아웃 / 로그인 실패 로그
 */
export const logLogin = async (
  userId: string | null,
  email: string,
  action: 'login' | 'logout' | 'failed',
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      email,
      action,
    })
  } catch {
    // silent catch
  }
}

/**
 * 개인정보 동의 로그
 */
export const logConsent = async (
  userId: string,
  email: string,
  ip?: string,
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      email,
      action:  'consent',
      ip,
    })
  } catch {
    // silent catch
  }
}
