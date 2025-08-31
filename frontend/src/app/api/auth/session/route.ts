import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // If Supabase is not configured, return anonymous session
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ user: null, warning: "Supabase not configured" });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return NextResponse.json({ user: null, error: error.message });
    }
    return NextResponse.json({ user: data.user ?? null });
  } catch (err: any) {
    return NextResponse.json(
      { user: null, error: err?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
