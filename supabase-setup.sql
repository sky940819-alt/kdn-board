-- ============================================================
--  한전KDN 자유게시판 Supabase 설정 SQL
--  Supabase Dashboard > SQL Editor 에서 실행하세요
--  https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- 1. posts 테이블
CREATE TABLE IF NOT EXISTS posts (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text        NOT NULL CHECK (char_length(title) <= 200),
  author      text        NOT NULL DEFAULT '익명' CHECK (char_length(author) <= 50),
  password    text        NOT NULL,
  content     text        NOT NULL,
  views       integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. attachments 테이블
CREATE TABLE IF NOT EXISTS attachments (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     uuid        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  filename    text        NOT NULL,
  filepath    text        NOT NULL,
  filesize    bigint      NOT NULL DEFAULT 0,
  mimetype    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_posts_created   ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attach_post_id  ON attachments(post_id);

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE posts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 (익명 CRUD 허용 — 내부 게시판용)
DO $$ BEGIN
  -- posts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_select') THEN
    CREATE POLICY posts_select ON posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_insert') THEN
    CREATE POLICY posts_insert ON posts FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_update') THEN
    CREATE POLICY posts_update ON posts FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='posts_delete') THEN
    CREATE POLICY posts_delete ON posts FOR DELETE USING (true);
  END IF;
  -- attachments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='attachments' AND policyname='att_select') THEN
    CREATE POLICY att_select ON attachments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='attachments' AND policyname='att_insert') THEN
    CREATE POLICY att_insert ON attachments FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='attachments' AND policyname='att_delete') THEN
    CREATE POLICY att_delete ON attachments FOR DELETE USING (true);
  END IF;
END $$;

-- 6. 조회수 atomic 증가 함수
CREATE OR REPLACE FUNCTION increment_views(pid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE posts SET views = views + 1 WHERE id = pid;
$$;

-- ============================================================
--  Storage 버킷 설정
--  아래 SQL로 버킷 생성 또는 Dashboard > Storage > New bucket
--  버킷명: board-attachments  /  Public bucket: ✓ 체크
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('board-attachments', 'board-attachments', true, 10485760, null)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책
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
