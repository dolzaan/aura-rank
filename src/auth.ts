import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/passwords";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (
          !user?.passwordHash ||
          !(await verifyPassword(parsed.data.password, user.passwordHash))
        ) {
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;
      const databaseUser = await prisma.user.upsert({
        where: { email: user.email.toLowerCase() },
        update: {
          name: user.name,
          image: user.image,
          emailVerified: new Date(),
        },
        create: {
          email: user.email.toLowerCase(),
          name: user.name,
          image: user.image,
          emailVerified: new Date(),
        },
      });
      user.id = databaseUser.id;
      user.username = databaseUser.username;
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.username = user.username;
        return token;
      }

      // Only refresh database-backed profile fields when SessionProvider.update()
      // explicitly asks for it. Normal navigation can trust the signed JWT.
      if (trigger === "update" && token.email) {
        const databaseUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
          },
        });
        if (databaseUser) {
          token.sub = databaseUser.id;
          token.name = databaseUser.name;
          token.email = databaseUser.email;
          token.picture = databaseUser.image;
          token.username = databaseUser.username;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username =
          typeof token.username === "string" ? token.username : null;
      }
      return session;
    },
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const signedIn = Boolean(session?.user?.id);
      if (!signedIn) return false;
      const onboardingRoute =
        pathname === "/onboarding" || pathname.startsWith("/api/onboarding");
      if (!session?.user?.username && !onboardingRoute) {
        return Response.redirect(new URL("/onboarding", request.nextUrl));
      }
      if (session?.user?.username && pathname === "/onboarding") {
        return Response.redirect(new URL("/feed", request.nextUrl));
      }
      return true;
    },
  },
});
