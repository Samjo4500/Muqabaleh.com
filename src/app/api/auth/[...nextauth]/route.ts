import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * On Vercel Preview, force NEXTAUTH_URL to the deployment host so
 * auth does not break when the shared env still points at production.
 */
if (
  process.env.VERCEL_ENV === 'preview' &&
  process.env.VERCEL_URL &&
  !process.env.NEXTAUTH_URL?.includes(process.env.VERCEL_URL)
) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
