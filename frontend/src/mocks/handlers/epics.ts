import { http, HttpResponse, delay } from "msw";
import { db } from "../db/schema";
import { maybeInjectNetworkControls } from "./util";

export const epicHandlers = [
  // List epics
  http.get("/api/epics", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const status = url.searchParams.get("status") as "proposed" | "in-progress" | "done" | null;

    await delay(250);

    const where: any = {};
    if (status) where.status = { equals: status };

    const data = db.epic.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });
    const total = db.epic.count({ where });

    return HttpResponse.json({ data, total, limit, offset });
  }),

  // Get epic by id
  http.get("/api/epics/:id", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    await delay(150);

    const { id } = params;
    const epic = db.epic.findFirst({ where: { id: { equals: id as string } } });
    if (!epic) return HttpResponse.json({ error: "Epic not found" }, { status: 404 });
    return HttpResponse.json(epic);
  }),

  // Create epic
  http.post("/api/epics", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    await delay(300);

    const body = (await request.json().catch(() => ({}))) as any;
    const title = (body.title || "").toString().trim();
    if (!title) return HttpResponse.json({ error: "title is required" }, { status: 400 });

    const description = (body.description || "").toString();
    const status = (body.status || "proposed") as "proposed" | "in-progress" | "done";
    const links = Array.isArray(body.links) ? body.links.map((s: any) => String(s)) : [];

    const epic = db.epic.create({
      // use default id generator (epic_<uuid>) unless provided
      title,
      description,
      status,
      links,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return HttpResponse.json(epic, { status: 201 });
  }),

  // Update epic
  http.put("/api/epics/:id", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    await delay(250);

    const { id } = params;
    const epic = db.epic.findFirst({ where: { id: { equals: id as string } } });
    if (!epic) return HttpResponse.json({ error: "Epic not found" }, { status: 404 });

    const updates = (await request.json().catch(() => ({}))) as any;
    const data: any = { updated_at: new Date().toISOString() };
    if (typeof updates.title === "string") data.title = updates.title;
    if (typeof updates.description === "string") data.description = updates.description;
    if (typeof updates.status === "string") data.status = updates.status;
    if (Array.isArray(updates.links)) data.links = updates.links.map((s: any) => String(s));

    const updated = db.epic.update({ where: { id: { equals: id as string } }, data });
    return HttpResponse.json(updated);
  }),

  // Delete epic
  http.delete("/api/epics/:id", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    await delay(200);

    const { id } = params;
    const epic = db.epic.findFirst({ where: { id: { equals: id as string } } });
    if (!epic) return HttpResponse.json({ error: "Epic not found" }, { status: 404 });

    db.epic.delete({ where: { id: { equals: id as string } } });
    return HttpResponse.json({ success: true });
  }),
];
