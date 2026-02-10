import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getCompanyFromCookie() {
  const cookie = cookies().get("company");
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
    const company = getCompanyFromCookie();
    if (!company) {
      return NextResponse.json([], { status: 200 });
    }

    const result =
      await sql`SELECT * FROM consultations WHERE company_id = ${company.id} ORDER BY id DESC`;

    const formatted = result.rows.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      contact: row.contact,
      region: row.region,
      address: row.address,
      pyung: row.pyung,
      status: row.status,
      pic: row.pic,
      note: row.note,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// 회사별 상담 저장
export async function POST(request: Request) {
  try {
    const company = getCompanyFromCookie();
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
    } = body;

    await sql`
      INSERT INTO consultations (company_id, customer_name, contact, region, address, pyung, status, pic, note)
      VALUES (${company.id}, ${customerName}, ${contact}, ${region}, ${address}, ${pyung}, ${status}, ${pic}, ${note})
    `;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

