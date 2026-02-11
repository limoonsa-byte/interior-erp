-- ============================================================
-- Vercel / Neon SQL Editor에 전부 복사해서 붙여넣은 뒤 [Run] 한 번에 실행
-- ============================================================

-- 1) 상담일시
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS consulted_at TEXT;

-- 2) 시공범위 체크 항목
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS scope TEXT;

-- 3) 담당자 설정용 테이블
CREATE TABLE IF NOT EXISTS company_pics (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(company_id, name)
);

-- 4) 관리 비밀번호 (숫자 4자리)
CREATE TABLE IF NOT EXISTS company_admin_pin (
  company_id INT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  pin TEXT NOT NULL
);
