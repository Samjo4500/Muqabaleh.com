import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function probe(name: string, fn: () => Promise<unknown>) {
  try { await fn(); console.log('OK', name); }
  catch (e: any) { console.log('FAIL', name, e.code, (e.message||'').split('\n')[0], '|', (e.meta && JSON.stringify(e.meta)) || ''); }
}
async function main() {
  await probe('interview.findMany', () => prisma.interview.findMany({ take: 1 }));
  await probe('humanBooking.findMany', () => prisma.humanBooking.findMany({ take: 1 }));
  await probe('message.findMany', () => prisma.message.findMany({ take: 1 }));
  await probe('paypalSubscription.findMany', () => prisma.paypalSubscription.findMany({ take: 1 }));
  await probe('interviewer.findMany', () => prisma.interviewer.findMany({ take: 1 }));
  await probe('company.findMany', () => prisma.company.findMany({ take: 1 }));
  await probe('question.findMany', () => prisma.question.findMany({ take: 1 }));
  await probe('interviewerAvailability.findMany', () => prisma.interviewerAvailability.findMany({ take: 1 }));
  await probe('b2BJob.findMany', () => prisma.b2BJob.findMany({ take: 1 }));
}
main().finally(() => prisma.$disconnect());
