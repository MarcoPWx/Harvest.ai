import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let password = "";
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      password = String(body?.password || "");
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      password = String((form as any).get("password") || "");
    } else {
      // Try JSON by default
      const body = await req.json().catch(() => ({}));
      password = String(body?.password || "");
    }

    const expected = process.env.SITE_DEMO_PASSWORD || "demo";
    if (!password || password !== expected) {
      return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("demo_auth", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Login failed" }, { status: 500 });
  }
}
