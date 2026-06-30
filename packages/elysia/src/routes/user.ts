import { Elysia, t } from "elysia";
import { auth } from "@myapp/auth";
import { db } from "@myapp/db";
import { users } from "@myapp/db";
import { eq } from "drizzle-orm";

// Middleware to validate the session from the cookie/bearer token
const withSession = new Elysia({ name: "with-session" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { session };
  }
);

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .use(withSession)

  // ─── GET /api/users/me ───────────────────────────────────────────────────
  .get("/me", async ({ session, set }) => {
    if (!session) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));
    return user ?? { error: "User not found" };
  })

  // ─── PATCH /api/users/me ─────────────────────────────────────────────────
  .patch(
    "/me",
    async ({ session, body, set }) => {
      if (!session) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const [updated] = await db
        .update(users)
        .set({ name: body.name, updatedAt: new Date() })
        .where(eq(users.id, session.user.id))
        .returning();
      return updated;
    },
    {
      body: t.Object({ name: t.String({ minLength: 1 }) }),
    }
  );
