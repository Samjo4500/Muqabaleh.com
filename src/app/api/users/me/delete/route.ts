import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Soft delete: deactivate account
    await db.user.update({
      where: { id: session.user.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'تم حذف الحساب' });
  } catch (e) {
    console.error('Delete user error:', e);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
