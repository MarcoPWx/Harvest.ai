import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Supabase not configured. Use mock auth in development." },
        { status: 501 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const { email, password, name } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create/ensure profile row exists
    const user = data.user;
    if (user) {
      try {
        await (supabase as any).from("users").upsert(
          { id: user.id, email: user.email, full_name: name ?? null },
          {
            onConflict: "id",
          },
        );
      } catch {}
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
