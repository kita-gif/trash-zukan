import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = Date.now() + ".jpg";
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, bytes);

    return NextResponse.json({
      url: `/uploads/${fileName}`,
    });
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e);
    return NextResponse.json(
      {
        error: "upload failed",
        detail: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}