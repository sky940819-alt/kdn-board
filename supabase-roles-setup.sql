-- ============================================================
--  한전KDN 역할 관리 Supabase 설정 SQL
--  Supabase Dashboard > SQL Editor 에서 실행하세요
--  https://supabase.com/dashboard/project/qglkelvxypbphldnohjw/sql/new
-- ============================================================

-- ──────────────────────────────────────────────
--  1. profiles 테이블 (auth.users 확장)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        NOT NULL,
  role        text        NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ──────────────────────────────────────────────
--  2. 기존 auth.users → profiles 동기화
--     (이미 가입된 사용자 마이그레이션)
-- ──────────────────────────────────────────────
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────
--  3. 새 가입 시 자동 프로필 생성 트리거
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ──────────────────────────────────────────────
--  4. 관리자 여부 확인 helper 함수
--     (RLS 순환 참조 방지용 SECURITY DEFINER)
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- ──────────────────────────────────────────────
--  5. RLS 활성화
-- ──────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
--  6. RLS 정책
-- ──────────────────────────────────────────────
DO $$ BEGIN
  -- 본인 프로필 조회
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_own') THEN
    CREATE POLICY profiles_select_own ON profiles FOR SELECT
      USING (auth.uid() = id OR is_admin());
  END IF;
  -- 관리자만 UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_admin_update') THEN
    CREATE POLICY profiles_admin_update ON profiles FOR UPDATE
      USING (is_admin());
  END IF;
  -- 트리거(SECURITY DEFINER)가 INSERT 하므로 별도 정책 불필요
  -- 하지만 anon INSERT도 허용해야 트리거 정상 작동
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_insert') THEN
    CREATE POLICY profiles_insert ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ──────────────────────────────────────────────
--  7. 역할 변경 RPC (관리자 전용)
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_user_role(target_user_id uuid, new_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: 관리자 권한이 필요합니다.';
  END IF;
  IF new_role NOT IN ('admin', 'user') THEN
    RAISE EXCEPTION 'Invalid role: admin 또는 user 만 허용됩니다.';
  END IF;
  UPDATE profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- ──────────────────────────────────────────────
--  8. 활성/비활성 토글 RPC (관리자 전용)
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION toggle_user_active(target_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: 관리자 권한이 필요합니다.';
  END IF;
  UPDATE profiles
  SET is_active = NOT is_active, updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- ──────────────────────────────────────────────
--  9. 최초 관리자 설정
--     아래 이메일을 실제 관리자 이메일로 변경 후 실행하세요
-- ──────────────────────────────────────────────
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@kdn.com';

-- ──────────────────────────────────────────────
--  완료 확인
-- ──────────────────────────────────────────────
SELECT 'profiles 테이블:' as check, count(*)::text as result FROM profiles
UNION ALL
SELECT 'admin 수:', count(*)::text FROM profiles WHERE role = 'admin'
UNION ALL
SELECT 'user 수:',  count(*)::text FROM profiles WHERE role = 'user';
