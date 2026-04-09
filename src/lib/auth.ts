import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              roleAssignments: true,
              sellerProfile: { select: { displayName: true } },
              buyerProfile: { select: { displayName: true } },
            },
          });

          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name:
              user.sellerProfile?.displayName ??
              user.buyerProfile?.displayName ??
              user.email,
            image: user.image,
            roles: user.roleAssignments.map((r) => r.role),
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
