import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { db } = await import('./db');
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) return null;
          if (!user.isActive) return null;

          const valid = await compare(credentials.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accountType: user.accountType,
            companyId: user.companyId ?? undefined,
            sessionsLeft: user.sessionsLeft,
            language: user.language,
            subscriptionTier: user.subscriptionTier,
          };
        } catch {
          // DB unavailable — cannot authenticate
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
        token.companyId = user.companyId;
        token.sessionsLeft = user.sessionsLeft;
        token.subscriptionTier = user.subscriptionTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).accountType = token.accountType;
        (session.user as Record<string, unknown>).companyId = token.companyId;
        (session.user as Record<string, unknown>).sessionsLeft = token.sessionsLeft;
        (session.user as Record<string, unknown>).language = token.language;
        (session.user as Record<string, unknown>).subscriptionTier = token.subscriptionTier;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      accountType: string;
      companyId?: string;
      sessionsLeft: number;
      language: string;
      subscriptionTier: string;
    } & DefaultSession['user'];
  }
  interface User {
    role: string;
    accountType: string;
    companyId?: string;
    sessionsLeft: number;
    language: string;
    subscriptionTier: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    accountType: string;
    companyId?: string;
    sessionsLeft: number;
    language: string;
    subscriptionTier: string;
  }
}
