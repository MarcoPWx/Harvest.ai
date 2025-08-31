import { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";

// GET /api/generations
// Returns paginated list of the current user's generations with optional filters
export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Auth: require user unless BYPASS_AUTH is set (for local/dev)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !process.env.BYPASS_AUTH) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const format = url.searchParams.get("format") as
      | Database["public"]["Enums"]["content_format"]
      | null;
    const model = url.searchParams.get("model");
    const fromDate = url.searchParams.get("from_date");
    const toDate = url.searchParams.get("to_date");
    const search = url.searchParams.get("search");

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Base query scoped to current user when available
    let query = supabase
      .from("content_generations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }) as any;

    if (user?.id) {
      query = query.eq("user_id", user.id);
    }

    if (format) query = query.eq("output_format", format);
    if (model) query = query.eq("model", model);
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);
    if (search) {
      // Simple search over input/output text
      query = query.or(`input_text.ilike.%${search}%,output_text.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(start, end);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const totalItems = count ?? data?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return Response.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
