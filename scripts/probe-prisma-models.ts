import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function probe(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    console.log('OK', name);
  } catch (e: any) {
    console.log('FAIL', name, e.code || '', (e.message || '').split('\n').slice(0, 4).join(' | '));
  }
}

async function main() {
  await probe('user.count', () => prisma.user.count());
  await probe('payment.findMany', () => prisma.payment.findMany({ take: 1 }));
  await probe('payment.aggregate', () => prisma.payment.aggregate({ _sum: { amount: true } }));
  await probe('interviewer.count', () => prisma.interviewer.count());
  await probe('interviewerAvailability.count', () => prisma.interviewerAvailability.count());
  await probe('humanBooking.count', () => prisma.humanBooking.count());
  await probe('interview.count', () => prisma.interview.count());
  await probe('message.count', () => prisma.message.count());
  await probe('paypalSubscription.count', () => prisma.paypalSubscription.count());
  await probe('auditLog.count', () => prisma.auditLog.count());
  await probe('candidatePool.count', () => prisma.candidatePool.count());
  await probe('emailQueue.count', () => prisma.emailQueue.count());
  await probe('adminLog.count', () => prisma.adminLog.count());
  await probe('company.count', () => prisma.company.count());
  await probe('question.count', () => prisma.question.count());
}
main().finally(() => prisma.$disconnect());
