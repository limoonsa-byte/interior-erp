import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// 상담 목록 조회
export async function GET() {
  try {
    const result =
      await sql`SELECT id, customer_name, contact, region, address, pyung, status, pic, note FROM consultations ORDER BY id DESC`;

    const formatted = result.rows.map((row) => ({
      id: row.id as number,
      customerName: row.customer_name as string,
      contact: row.contact as string,
      region: row.region as string,
      address: row.address as string,
      pyung: row.pyung as number,
      status: row.status as string,
      pic: row.pic as string | null,
      note: row.note as string | null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("consultations GET error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// 상담 저장
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
    } = body;

    await sql`
      INSERT INTO consultations (customer_name, contact, region, address, pyung, status, pic, note)
      VALUES (${customerName}, ${contact}, ${region}, ${address}, ${pyung}, ${status}, ${pic}, ${note})
    `;

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("consultations POST error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

