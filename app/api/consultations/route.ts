import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// 이메일로 회사 ID 찾기 (없으면 자동 생성)
async function getCompanyId(email: string) {
  const memberCheck =
    await sql`SELECT company_id FROM members WHERE email = ${email}`;

  if (memberCheck.rows.length > 0) {
    return memberCheck.rows[0].company_id as number;
  }

  const newCompanyName = `${email.split("@")[0]}의 회사`;

  const newCompany =
    await sql`INSERT INTO companies (name) VALUES (${newCompanyName}) RETURNING id`;
  const companyId = newCompany.rows[0].id as number;

  await sql`
    INSERT INTO members (company_id, email, role)
    VALUES (${companyId}, ${email}, 'owner')
  `;

  return companyId;
}

// 회사별 상담 조회
export async function GET(request: Request) {
  try {
    const email = request.headers.get("user-email");
    if (!email) {
      return NextResponse.json([], { status: 200 });
    }

    const companyId = await getCompanyId(email);

    const result =
      await sql`SELECT * FROM consultations WHERE company_id = ${companyId} ORDER BY id DESC`;

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
      userEmail,
    } = body;

    if (!userEmail) {
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 });
    }

    const companyId = await getCompanyId(userEmail);

    await sql`
      INSERT INTO consultations (company_id, customer_name, contact, region, address, pyung, status, pic, note)
      VALUES (${companyId}, ${customerName}, ${contact}, ${region}, ${address}, ${pyung}, ${status}, ${pic}, ${note})
    `;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}


