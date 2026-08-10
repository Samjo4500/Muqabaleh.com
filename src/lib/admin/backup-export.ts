import { db } from '@/lib/db';

/**
 * Operational snapshot of key tables (no password hashes / secrets).
 * Full Postgres recovery remains on Supabase PITR / dashboard backups.
 */
export async function buildOperationalBackup() {
  const [
    counts,
    users,
    companies,
    partners,
    partnerApplications,
    subscriptions,
    payments,
    interviews,
    mockSessions,
    listedCompanies,
    listedJobsSample,
    emailTemplates,
    adminSettings,
    supportTickets,
    marketingContacts,
  ] = await Promise.all([
    Promise.all([
      db.user.count(),
      db.company.count(),
      db.partner.count(),
      db.interview.count(),
      db.interviewSession.count(),
      db.listedJob.count({ where: { isActive: true } }),
      db.listedCompany.count({ where: { isActive: true } }),
      db.payment.count(),
      db.emailQueue.count(),
      db.supportTicket.count(),
      db.marketingContact.count().catch(() => 0),
    ]).then(
      ([
        users,
        companies,
        partners,
        interviews,
        mockSessions,
        activeListedJobs,
        listedCompanies,
        payments,
        emailQueue,
        tickets,
        marketingContacts,
      ]) => ({
        users,
        companies,
        partners,
        marketingContacts,
        interviews,
        mockSessions,
        activeListedJobs,
        listedCompanies,
        payments,
        emailQueue,
        tickets,
      }),
    ),
    db.user.findMany({
      take: 5000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        accountType: true,
        isActive: true,
        companyId: true,
        partnerId: true,
        sessionsLeft: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    db.company.findMany({
      take: 2000,
      orderBy: { createdAt: 'desc' },
    }),
    db.partner.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' },
    }),
    db.partnerApplication.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' },
    }),
    db.paypalSubscription.findMany({
      take: 2000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        paypalSubscriptionId: true,
        paypalPlanId: true,
        status: true,
        startTime: true,
        nextBillingTime: true,
        createdAt: true,
      },
    }),
    db.payment.findMany({
      take: 3000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        type: true,
        packageType: true,
        createdAt: true,
        capturedAt: true,
      },
    }),
    db.interview.findMany({
      take: 3000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        status: true,
        industry: true,
        type: true,
        mode: true,
        overallScore: true,
        verificationId: true,
        createdAt: true,
      },
    }),
    db.interviewSession.findMany({
      take: 2000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        status: true,
        language: true,
        overallScore: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    db.listedCompany.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    }),
    db.listedJob.findMany({
      where: { isActive: true },
      orderBy: { fetchedAt: 'desc' },
      take: 2000,
      select: {
        id: true,
        companyId: true,
        externalId: true,
        title: true,
        slug: true,
        location: true,
        source: true,
        applyUrl: true,
        isActive: true,
        postedAt: true,
        fetchedAt: true,
      },
    }),
    db.emailTemplate.findMany({ take: 500, orderBy: { createdAt: 'desc' } }),
    db.adminSetting.findMany({ take: 200, orderBy: { updatedAt: 'desc' } }),
    db.supportTicket.findMany({
      take: 1000,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdById: true,
        assigneeId: true,
        createdAt: true,
        closedAt: true,
      },
    }),
    db.marketingContact
      .findMany({
        take: 10000,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          country: true,
          location: true,
          industry: true,
          experience: true,
          role: true,
          level: true,
          linkedInUrl: true,
          locale: true,
          source: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          marketingOptIn: true,
          createdAt: true,
          lastSeenAt: true,
        },
      })
      .catch(() => []),
  ]);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      brand: 'Muqabaleh',
      kind: 'operational-export',
      note:
        'Does not include password hashes, API key material, or TOTP secrets. Full DB recovery = Supabase backups/PITR. Website code = Git + Vercel deployments.',
      counts,
    },
    users,
    companies,
    partners,
    partnerApplications,
    subscriptions,
    payments,
    interviews,
    mockSessions,
    listedCompanies,
    listedJobsSample,
    emailTemplates,
    adminSettings,
    supportTickets,
    marketingContacts,
  };
}

export async function recordBackupLog(params: {
  type: string;
  status: string;
  notes?: string;
  location?: string;
  sizeBytes?: number;
}) {
  return db.backupLog.create({
    data: {
      type: params.type,
      status: params.status,
      notes: params.notes,
      location: params.location,
      sizeBytes: params.sizeBytes,
      completedAt: params.status === 'COMPLETED' ? new Date() : undefined,
    },
  });
}
