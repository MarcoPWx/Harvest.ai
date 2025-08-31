import { http, HttpResponse, delay } from "msw";
import { db } from "../db/schema";
import { faker } from "@faker-js/faker";
import { maybeInjectNetworkControls } from "./util";

export const templateHandlers = [
  // Get all templates
  http.get("/api/templates", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const category = url.searchParams.get("category");

    let templates = db.template.getAll();

    if (userId) {
      templates = templates.filter((t) => t.user_id === userId || t.is_public);
    }

    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    return HttpResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        prompt: t.prompt,
        variables: t.variables,
        is_public: t.is_public,
        created_by: t.user_id,
        created_at: t.created_at,
        usage_count: t.usage_count,
      })),
    });
  }),

  // Get template by ID
  http.get("/api/templates/:templateId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(300);

    const { templateId } = params;
    const template = db.template.findFirst({
      where: { id: { equals: templateId as string } },
    });

    if (!template) {
      return HttpResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return HttpResponse.json(template);
  }),

  // Create template
  http.post("/api/templates", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(800);

    const body = (await request.json()) as any;

    const newTemplate = db.template.create({
      name: body.name,
      description: body.description,
      category: body.category || "custom",
      prompt: body.prompt,
      variables: body.variables || [],
      is_public: body.is_public || false,
      user_id: body.user_id || "demo-user",
      usage_count: 0,
    });

    return HttpResponse.json({
      template: newTemplate,
      message: "Template created successfully",
    });
  }),

  // Update template
  http.put("/api/templates/:templateId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(600);

    const { templateId } = params;
    const updates = (await request.json()) as any;

    const template = db.template.findFirst({
      where: { id: { equals: templateId as string } },
    });

    if (!template) {
      return HttpResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const updatedTemplate = db.template.update({
      where: { id: { equals: templateId as string } },
      data: updates,
    });

    return HttpResponse.json({
      template: updatedTemplate,
      message: "Template updated successfully",
    });
  }),

  // Delete template
  http.delete("/api/templates/:templateId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    const { templateId } = params;

    db.template.delete({
      where: { id: { equals: templateId as string } },
    });

    return HttpResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  }),

  // Clone template
  http.post("/api/templates/:templateId/clone", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(700);

    const { templateId } = params;
    const body = (await request.json()) as any;

    const originalTemplate = db.template.findFirst({
      where: { id: { equals: templateId as string } },
    });

    if (!originalTemplate) {
      return HttpResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const clonedTemplate = db.template.create({
      name: body.name || `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      category: originalTemplate.category,
      prompt: originalTemplate.prompt,
      variables: originalTemplate.variables,
      is_public: false,
      user_id: body.user_id || "demo-user",
      usage_count: 0,
    });

    return HttpResponse.json({
      template: clonedTemplate,
      message: "Template cloned successfully",
    });
  }),

  // Get template categories
  http.get("/api/templates/categories", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(200);

    return HttpResponse.json({
      categories: [
        { id: "marketing", name: "Marketing", icon: "📢" },
        { id: "sales", name: "Sales", icon: "💼" },
        { id: "education", name: "Education", icon: "🎓" },
        { id: "technical", name: "Technical", icon: "💻" },
        { id: "creative", name: "Creative", icon: "🎨" },
        { id: "custom", name: "Custom", icon: "⚙️" },
      ],
    });
  }),
];

export const teamHandlers = [
  // Get user's teams
  http.get("/api/teams", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    let teams = db.team.getAll();

    if (userId) {
      teams = teams.filter(
        (t) => t.owner_id === userId || (t.members && t.members.includes(userId)),
      );
    }

    return HttpResponse.json({
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        owner_id: t.owner_id,
        members: t.members,
        created_at: t.created_at,
        settings: t.settings,
      })),
    });
  }),

  // Get team by ID
  http.get("/api/teams/:teamId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(300);

    const { teamId } = params;
    const team = db.team.findFirst({
      where: { id: { equals: teamId as string } },
    });

    if (!team) {
      return HttpResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return HttpResponse.json(team);
  }),

  // Create team
  http.post("/api/teams", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1000);

    const body = (await request.json()) as any;

    const newTeam = db.team.create({
      name: body.name,
      description: body.description,
      owner_id: body.owner_id || "demo-user",
      members: [body.owner_id || "demo-user"],
      settings: body.settings || {},
    });

    return HttpResponse.json({
      team: newTeam,
      message: "Team created successfully",
    });
  }),

  // Update team
  http.patch("/api/teams/:teamId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(600);

    const { teamId } = params;
    const updates = (await request.json()) as any;

    const team = db.team.findFirst({
      where: { id: { equals: teamId as string } },
    });

    if (!team) {
      return HttpResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const updatedTeam = db.team.update({
      where: { id: { equals: teamId as string } },
      data: updates,
    });

    return HttpResponse.json({
      team: updatedTeam,
      message: "Team updated successfully",
    });
  }),

  // Delete team
  http.delete("/api/teams/:teamId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(800);

    const { teamId } = params;

    db.team.delete({
      where: { id: { equals: teamId as string } },
    });

    return HttpResponse.json({
      success: true,
      message: "Team deleted successfully",
    });
  }),

  // Add team member
  http.post("/api/teams/:teamId/members", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(700);

    const { teamId } = params;
    const body = (await request.json()) as any;
    const { email, role } = body;

    const team = db.team.findFirst({
      where: { id: { equals: teamId as string } },
    });

    if (!team) {
      return HttpResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Create a mock user for the invited member
    const newMemberId = faker.string.uuid();
    const updatedTeam = db.team.update({
      where: { id: { equals: teamId as string } },
      data: {
        members: [...(team.members || []), newMemberId],
      },
    });

    return HttpResponse.json({
      team: updatedTeam,
      message: `Invitation sent to ${email}`,
    });
  }),

  // Remove team member
  http.delete("/api/teams/:teamId/members/:memberId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(600);

    const { teamId, memberId } = params;

    const team = db.team.findFirst({
      where: { id: { equals: teamId as string } },
    });

    if (!team) {
      return HttpResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const updatedTeam = db.team.update({
      where: { id: { equals: teamId as string } },
      data: {
        members: team.members?.filter((m) => m !== memberId) || [],
      },
    });

    return HttpResponse.json({
      team: updatedTeam,
      message: "Member removed successfully",
    });
  }),
];
