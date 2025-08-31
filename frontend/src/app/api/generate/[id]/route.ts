import { createClient } from "@/lib/supabase/server";

// GET /api/generate/:id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !process.env.BYPASS_AUTH) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    let query = supabase.from("content_generations").select("*").eq("id", id);
    if (user?.id) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await (query as any).single();
    if (error) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    return Response.json({ generation: data });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

// DELETE /api/generate/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !process.env.BYPASS_AUTH) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    // Ensure only owner can delete
    const result = await (supabase
      .from("content_generations")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id || "")
      .select() as any);

    if (result.error) {
      return Response.json({ error: result.error.message }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
