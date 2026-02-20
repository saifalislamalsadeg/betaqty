import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/auth';

export async function GET() {
  try {
    // التحقق من المصادقة
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }
    
    const totalCards = await db.card.count();
    const pendingCards = await db.card.count({
      where: { paymentStatus: 'PENDING' },
    });
    const uploadedCards = await db.card.count({
      where: { paymentStatus: 'UPLOADED' },
    });
    const approvedCards = await db.card.count({
      where: { paymentStatus: 'APPROVED' },
    });
    const rejectedCards = await db.card.count({
      where: { paymentStatus: 'REJECTED' },
    });
    
    // إحصائيات المصارف
    const bankStats = await db.bank.findMany({
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      stats: {
        total: totalCards,
        pending: pendingCards,
        uploaded: uploadedCards,
        approved: approvedCards,
        rejected: rejectedCards,
      },
      bankStats: bankStats.map((bank) => ({
        id: bank.id,
        name: bank.nameAr,
        count: bank._count.cards,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإحصائيات' },
      { status: 500 }
    );
  }
}
