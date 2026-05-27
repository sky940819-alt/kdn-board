-- ============================================================
--  한전KDN 인증·로그 테이블 Supabase 설정 SQL
--  Supabase Dashboard > SQL Editor 에서 실행하세요
--  https://supabase.com/dashboard/project/qglkelvxypbphldnohjw/sql/new
-- ============================================================

-- ※ 이메일 확인 없이 즉시 로그인하려면 (내부 전용):
--   Dashboard > Authentication > Providers > Email
--   "Confirm email" 비활성화

-- ──────────────────────────────────────────────
--  1. 접속 로그 (login / logout / failed)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_logs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email       text        NOT NULL,
  action      text        NOT NULL CHECK (action IN ('login', 'logout', 'failed')),
  ip_address  text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_logs_user  ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_time  ON login_logs(created_at DESC);

-- ──────────────────────────────────────────────
--  2. 활동 로그 (게시판 CRUD · 검색)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email        text        NOT NULL,
  action       text        NOT NULL,
  -- action values: post_view, post_create, post_edit, post_delete, post_search
  target_id    uuid,
  target_title text,
  extra        jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_act_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_act_logs_time ON activity_logs(created_at DESC);

-- ──────────────────────────────────────────────
--  3. 개인정보 동의 기록
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS privacy_consents (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text        NOT NULL,
  version      text        NOT NULL DEFAULT '1.0',
  ip_address   text,
  consented_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_user ON privacy_consents(user_id, version);

-- ──────────────────────────────────────────────
--  4. RLS 활성화
-- ──────────────────────────────────────────────
ALTER TABLE login_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
--  5. RLS 정책
-- ──────────────────────────────────────────────
DO $$ BEGIN
  -- login_logs: 누구나 INSERT (미인증 실패 로그 포함), 본인 로그만 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='login_logs' AND policyname='ll_insert') THEN
    CREATE POLICY ll_insert ON login_logs FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='login_logs' AND policyname='ll_select') THEN
    CREATE POLICY ll_select ON login_logs FOR SELECT USING (
      auth.uid() = user_id OR auth.uid() IS NOT NULL
    );
  END IF;

  -- activity_logs: 인증 사용자 INSERT, 본인 로그 SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='activity_logs' AND policyname='al_insert') THEN
    CREATE POLICY al_insert ON activity_logs FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='activity_logs' AND policyname='al_select') THEN
    CREATE POLICY al_select ON activity_logs FOR SELECT USING (
      auth.uid() = user_id OR auth.uid() IS NOT NULL
    );
  END IF;

  -- privacy_consents: 본인만 INSERT/SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='privacy_consents' AND policyname='pc_insert') THEN
    CREATE POLICY pc_insert ON privacy_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='privacy_consents' AND policyname='pc_select') THEN
    CREATE POLICY pc_select ON privacy_consents FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ──────────────────────────────────────────────
--  6. 편의용 뷰 (Dashboard 에서 로그 확인용)
-- ──────────────────────────────────────────────
CREATE OR REPLACE VIEW v_login_logs AS
  SELECT
    ll.created_at,
    ll.action,
    ll.email,
    ll.ip_address,
    substring(ll.user_agent, 1, 80) AS ua_short,
    ll.id
  FROM login_logs ll
  ORDER BY ll.created_at DESC;

CREATE OR REPLACE VIEW v_activity_logs AS
  SELECT
    al.created_at,
    al.action,
    al.email,
    al.target_title,
    al.target_id,
    al.extra,
    al.id
  FROM activity_logs al
  ORDER BY al.created_at DESC;
