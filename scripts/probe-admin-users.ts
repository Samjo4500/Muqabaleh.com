import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const data = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        country: true,
        tier: true,
        sessionsLeft: true,
        role: true,
        accountType: true,
        isActive: true,
        createdAt: true,
        _count: { select: { interviews: true, payments: true } },
      },
    });
    console.log('OK users', data.length, data[0]);
  } catch (e: any) {
    console.log('FAIL users', e.code, e.message);
  }

  // app page style query
  try {
    const sessionUserId = 'cmseeu2oq46daa37a3b3265a0';
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    console.log('user', user && { sessionsLeft: user.sessionsLeft, name: user.name });
    const interviews = await prisma.interview.findMany({
      where: { userId: sessionUserId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log('OK interviews', interviews.length);
  } catch (e: any) {
    console.log('FAIL app-query', e.code, e.message?.slice(0, 300));
  }
}
main().finally(() => prisma.$disconnect());
