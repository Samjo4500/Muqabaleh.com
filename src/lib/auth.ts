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
const REMEMBER_ME_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 days

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text' },
        rememberMe: { label: 'Remember Me', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { db } = await import('./db');
          const { isSuperAdminEmail } = await import('@/lib/admin/constants');
          const normalizedEmail = credentials.email.trim().toLowerCase();
          const user = await db.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
          });

          if (!user || !user.passwordHash) {
            await auditLoginFailed(credentials.email);
            return null;
          }

          const isSuperAdmin = isSuperAdminEmail(user.email);

          if (!user.isActive && !isSuperAdmin) {
            await auditLoginFailed(credentials.email);
            return null;
          }

          if (user.lockedUntil && user.lockedUntil > new Date() && !isSuperAdmin) {
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

          if (isSuperAdmin && (user.role !== UserRole.SUPER_ADMIN || !user.isActive || (user.failedLoginAttempts || 0) > 0 || user.lockedUntil !== null)) {
            await db.user.update({
              where: { id: user.id },
              data: {
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
              },
            });
            user.role = UserRole.SUPER_ADMIN;
            user.isActive = true;
          } else {
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
              },
            });
          }

          if (user.role === UserRole.SUPER_ADMIN || isSuperAdmin) {
            await auditLoginSuccess(user.id, user.email);
          }

          const rememberMe =
            String((credentials as { rememberMe?: string }).rememberMe || '') === 'true';

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: isSuperAdmin ? UserRole.SUPER_ADMIN : user.role,
            accountType: user.accountType,
            companyId: user.companyId ?? undefined,
            partnerId: (user as { partnerId?: string | null }).partnerId ?? undefined,
            sessionsLeft: isSuperAdmin ? 999 : user.sessionsLeft,
            language: user.language,
            tier: isSuperAdmin ? 'UNLIMITED' : user.tier,
            rememberMe,
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
    // Upper bound; actual expiry set per-login in jwt callback
    maxAge: REMEMBER_ME_SESSION_SECONDS,
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
      const { isSuperAdminEmail } = await import('@/lib/admin/constants');
      if (user) {
        token.id = user.id;
        token.email = user.email;
        const isSuperAdmin = isSuperAdminEmail(user.email);
        token.role = isSuperAdmin ? UserRole.SUPER_ADMIN : user.role;
        token.accountType = user.accountType;
        token.companyId = user.companyId;
        token.partnerId = (user as { partnerId?: string }).partnerId;
        token.sessionsLeft = isSuperAdmin ? 999 : user.sessionsLeft;
        token.tier = isSuperAdmin ? 'UNLIMITED' : user.tier;
        const rememberMe = Boolean((user as { rememberMe?: boolean }).rememberMe);
        token.rememberMe = rememberMe;

        // Shorter session timeout for Super Admin
        if (token.role === UserRole.SUPER_ADMIN) {
          token.exp = Math.floor(Date.now() / 1000) + SUPER_ADMIN_SESSION_SECONDS;
        } else if (rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + REMEMBER_ME_SESSION_SECONDS;
        } else {
          token.exp = Math.floor(Date.now() / 1000) + DEFAULT_SESSION_SECONDS;
        }
      } else if (token.id) {
        const isSuperAdmin = isSuperAdminEmail(token.email as string);
        if (isSuperAdmin) {
          token.role = UserRole.SUPER_ADMIN;
          token.tier = 'UNLIMITED';
        }
        // Refresh entitlement fields after PayPal activate / admin grants
        // without forcing a full re-login. Throttle to once per ~60s.
        const lastRefresh = Number(token.entitlementRefreshAt || 0);
        const now = Date.now();
        if (now - lastRefresh > 60_000) {
          try {
            const { db } = await import('./db');
            const fresh = await db.user.findUnique({
              where: { id: String(token.id) },
              select: {
                tier: true,
                sessionsLeft: true,
                role: true,
                isActive: true,
                accountType: true,
                companyId: true,
                partnerId: true,
                email: true,
              },
            });
            if (fresh) {
              const freshIsSuperAdmin = isSuperAdminEmail(fresh.email);
              if (!fresh.isActive && !freshIsSuperAdmin) {
                // Force logout when Super Admin deactivates / revokes sessions.
                // session() callback treats missing role as unauthenticated for admin routes.
                token.error = 'InactiveUser';
                token.role = 'USER';
                token.accountType = 'INDIVIDUAL';
              } else {
                token.tier = freshIsSuperAdmin ? 'UNLIMITED' : fresh.tier;
                token.sessionsLeft = freshIsSuperAdmin ? 999 : fresh.sessionsLeft;
                token.role = freshIsSuperAdmin ? UserRole.SUPER_ADMIN : fresh.role;
                token.accountType = fresh.accountType;
                token.companyId = fresh.companyId ?? undefined;
                token.partnerId = fresh.partnerId ?? undefined;
                if ('error' in token) delete (token as { error?: string }).error;
              }
            }
            token.entitlementRefreshAt = now;
          } catch {
            // keep existing token claims if DB is briefly unavailable
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      const { isSuperAdminEmail } = await import('@/lib/admin/constants');
      if (session.user) {
        const isSuperAdmin = isSuperAdminEmail(session.user.email || (token.email as string));
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = isSuperAdmin ? UserRole.SUPER_ADMIN : token.role;
        (session.user as Record<string, unknown>).accountType = token.accountType;
        (session.user as Record<string, unknown>).companyId = token.companyId;
        (session.user as Record<string, unknown>).partnerId = token.partnerId;
        (session.user as Record<string, unknown>).sessionsLeft = isSuperAdmin ? 999 : token.sessionsLeft;
        (session.user as Record<string, unknown>).language = token.language;
        (session.user as Record<string, unknown>).tier = isSuperAdmin ? 'UNLIMITED' : token.tier;
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
      partnerId?: string;
      sessionsLeft: number;
      language: string;
      tier: string;
    } & DefaultSession['user'];
  }
  interface User {
    role: string;
    accountType: string;
    companyId?: string;
    partnerId?: string;
    sessionsLeft: number;
    language: string;
    tier: string;
    rememberMe?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    accountType: string;
    companyId?: string;
    partnerId?: string;
    sessionsLeft: number;
    language: string;
    tier: string;
    rememberMe?: boolean;
  }
}
