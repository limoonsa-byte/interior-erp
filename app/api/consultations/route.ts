import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getCompanyFromCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("company");
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value) as { id: number; code: string; name: string };
  } catch {
    return null;
  }
}

// 회사별 상담 조회
export async function GET() {
  try {
    const company = await getCompanyFromCookie();
    if (!company) {
      return NextResponse.json([], { status: 200 });
    }

    const result =
      await sql`SELECT * FROM consultations WHERE company_id = ${company.id} ORDER BY id DESC`;

    const formatted = result.rows.map((row) => {
      let scope: string[] | undefined;
      if (row.scope != null && String(row.scope).trim() !== "") {
        try {
          scope = JSON.parse(String(row.scope)) as string[];
        } catch {
          scope = undefined;
        }
      }
      return {
        id: row.id,
        customerName: row.customer_name,
        contact: row.contact,
        region: row.region,
        address: row.address,
        pyung: row.pyung,
        status: row.status,
        pic: row.pic,
        note: row.note,
        consultedAt: row.consulted_at != null ? String(row.consulted_at) : undefined,
        scope,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 회사별 상담 저장
export async function POST(request: Request) {
  try {
    const company = await getCompanyFromCookie();
    if (!company) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName,
      contact,
      region,
      address,
      pyung,
      status,
      pic,
      note,
      consultedAt,
      scope,
    } = body;

    const scopeJson = Array.isArray(scope) ? JSON.stringify(scope) : null;

    await sql`
      INSERT INTO consultations (company_id, customer_name, contact, region, address, pyung, status, pic, note, consulted_at, scope)
      VALUES (${company.id}, ${customerName}, ${contact}, ${region}, ${address}, ${pyung}, ${status}, ${pic}, ${note}, ${consultedAt ?? null}, ${scopeJson})
    `;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("DB Error:", error);
    const message =
      error instanceof Error && /consulted_at|scope|column/i.test(error.message)
        ? "DB에 consulted_at 또는 scope 컬럼이 없을 수 있습니다. Vercel/Neon SQL에서 sql/add_consulted_at.sql, sql/add_scope.sql 을 실행해 주세요."
        : "Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

