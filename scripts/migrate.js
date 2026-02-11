/**
 * 배포(빌드) 시 자동 실행되는 DB 마이그레이션.
 * Vercel 빌드 시 환경변수 POSTGRES_URL 등이 있으면 실행됩니다.
 */
const { sql } = require("@vercel/postgres");

async function migrate() {
  try {
    await sql`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS consulted_at TEXT`;
    console.log("[migrate] consulted_at OK");
    await sql`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS scope TEXT`;
    console.log("[migrate] scope OK");
    await sql`
      CREATE TABLE IF NOT EXISTS company_pics (
        id SERIAL PRIMARY KEY,
        company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        UNIQUE(company_id, name)
      )
    `;
    console.log("[migrate] company_pics OK");
    await sql`
      CREATE TABLE IF NOT EXISTS company_admin_pin (
        company_id INT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
        pin TEXT NOT NULL
      )
    `;
    console.log("[migrate] company_admin_pin OK");
    console.log("[migrate] 완료");
  } catch (err) {
    console.error("[migrate] 실패:", err.message);
    process.exit(1);
  }
  process.exit(0);
}

migrate();
