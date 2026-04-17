/**
 * NextAuth configuration. Imported by apps/web/auth.ts.
 *
 * On first sign-in we provision a personal workspace + OWNER membership.
 */
import NextAuth, { type NextAuthConfig, type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@launchmint/db";
import { WorkspaceType, Role } from "@launchmint/db";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isSuperAdmin: boolean;
      isModerator: boolean;
      activeWorkspaceId?: string | null;
    };
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function ensureUniqueWorkspaceSlug(base: string): Promise<string> {
  const baseSlug = slugify(base) || "workspace";
  let slug = baseSlug;
  let n = 1;
  // best-effort uniqueness; collisions are rare at this stage
  while (await db.workspace.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      const existing = await db.user.findUnique({ where: { email: user.email } });

      if (existing) {
        if (account?.provider === "google" && profile?.sub && !existing.googleId) {
          await db.user.update({
            where: { id: existing.id },
            data: { googleId: profile.sub, name: existing.name ?? user.name ?? null },
          });
        }
        return true;
      }

      const created = await db.user.create({
        data: {
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          avatarUrl: user.image ?? null,
          googleId: account?.provider === "google" ? (profile?.sub ?? null) : null,
          emailVerified: new Date(),
        },
      });

      const baseName = (created.name ?? "workspace").split(" ")[0] ?? "workspace";
      const slug = await ensureUniqueWorkspaceSlug(`${baseName}-workspace`);

      const workspace = await db.workspace.create({
        data: {
          slug,
          name: `${created.name ?? "Personal"} Workspace`,
          type: WorkspaceType.FOUNDER,
        },
      });

      await db.workspaceMember.create({
        data: { userId: created.id, workspaceId: workspace.id, role: Role.OWNER },
      });

      await db.subscription.create({
        data: { workspaceId: workspace.id },
      });

      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const user = await db.user.findUnique({
        where: { email: token.email },
        select: { id: true, isSuperAdmin: true, isModerator: true },
      });
      if (user) {
        token.uid = user.id;
        token.isSuperAdmin = user.isSuperAdmin;
        token.isModerator = user.isModerator;

        const member = await db.workspaceMember.findFirst({
          where: { userId: user.id },
          orderBy: { joinedAt: "asc" },
          select: { workspaceId: true },
        });
        token.activeWorkspaceId = member?.workspaceId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = token.uid as string;
        session.user.isSuperAdmin = Boolean(token.isSuperAdmin);
        session.user.isModerator = Boolean(token.isModerator);
        session.user.activeWorkspaceId = (token.activeWorkspaceId as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
