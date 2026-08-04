import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { verifySync } from 'otplib';
import { auditLoginFailed, auditLoginSuccess } from './security';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const SUPER_ADMIN_SESSION_SECONDS = 2 * 60 * 60; // 2 hours
const DEFAULT_SESSION_SECONDS = 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { db } = await import('./db');
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            await auditLoginFailed(credentials.email);
            return null;
          }
          if (!user.isActive) {
            await auditLoginFailed(credentials.email);
            return null;
          }

          if (user.lockedUntil && user.lockedUntil > new Date()) {
            await auditLoginFailed(credentials.email);
            return null;
          }

          const valid = await compare(credentials.password, user.passwordHash);
          if (!valid) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: attempts,
                lockedUntil:
                  attempts >= LOCKOUT_ATTEMPTS
                    ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                    : null,
              },
            });
            await auditLoginFailed(credentials.email);
            return null;
          }

          // SUPER_ADMIN 2FA enforcement when enrolled
          if (user.role === UserRole.SUPER_ADMIN && user.totpEnabled && user.totpSecret) {
            const code = (credentials as { totpCode?: string }).totpCode?.trim();
            const ok = code
              ? Boolean(verifySync({ token: code, secret: user.totpSecret }).valid)
              : false;
            if (!ok) {
              await auditLoginFailed(credentials.email);
              return null;
            }
          }

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
            },
          });

          if (user.role === UserRole.SUPER_ADMIN) {
            await auditLoginSuccess(user.id, user.email);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accountType: user.accountType,
            companyId: user.companyId ?? undefined,
            sessionsLeft: user.sessionsLeft,
            language: user.language,
            tier: user.tier,
          };
        } catch {
          await auditLoginFailed(credentials.email);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: DEFAULT_SESSION_SECONDS,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
        token.companyId = user.companyId;
        token.sessionsLeft = user.sessionsLeft;
        token.tier = user.tier;
        // Shorter session timeout for Super Admin
        if (user.role === UserRole.SUPER_ADMIN) {
          token.exp = Math.floor(Date.now() / 1000) + SUPER_ADMIN_SESSION_SECONDS;
        }
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
        (session.user as Record<string, unknown>).tier = token.tier;
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
      tier: string;
    } & DefaultSession['user'];
  }
  interface User {
    role: string;
    accountType: string;
    companyId?: string;
    sessionsLeft: number;
    language: string;
    tier: string;
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
    tier: string;
  }
}
