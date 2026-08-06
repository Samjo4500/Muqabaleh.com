import { NextRequest, NextResponse } from 'next/server';
import { verifyJeannieActionToken } from '@/lib/jeannie/tokens';
import { approveOpportunity, rejectOpportunity } from '@/lib/jeannie/opportunity-service';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://muqabaleh.com';

/**
 * One-click approve/reject from Jeannie digest emails.
 * GET so mailto/button links work without a session cookie.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const parsed = verifyJeannieActionToken(token);
  if (!parsed) {
    return NextResponse.redirect(`${APP_URL}/en/app/jeannie?jeannie=token_invalid`);
  }

  try {
    if (parsed.action === 'approve') {
      const result = await approveOpportunity(parsed.userId, parsed.opportunityId, {
        autoApply: true,
      });
      if (!result.ok) {
        return NextResponse.redirect(
          `${APP_URL}/en/app/jeannie?jeannie=approve_failed&reason=${encodeURIComponent(result.error)}`,
        );
      }
      if ('deliveryError' in result && result.deliveryError) {
        return NextResponse.redirect(
          `${APP_URL}/en/app/jeannie?jeannie=approved_needs_cv`,
        );
      }
      return NextResponse.redirect(`${APP_URL}/en/app/jeannie?jeannie=applied`);
    }

    const rejected = await rejectOpportunity(parsed.userId, parsed.opportunityId);
    if (!rejected.ok) {
      return NextResponse.redirect(`${APP_URL}/en/app/jeannie?jeannie=reject_failed`);
    }
    return NextResponse.redirect(`${APP_URL}/en/app/jeannie?jeannie=rejected`);
  } catch (err) {
    console.error('GET /api/jeannie/email-action', err);
    return NextResponse.redirect(`${APP_URL}/en/app/jeannie?jeannie=error`);
  }
}
