import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/auth';

// جلب جميع الطلبات - يتطلب تسجيل دخول
export async function GET(request: Request) {
  try {
    // التحقق من المصادقة
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const whereClause: Record<string, unknown> = {};
    
    if (status && status !== 'ALL') {
      whereClause.paymentStatus = status;
    }
    
    const cards = await db.card.findMany({
      where: whereClause,
      include: { bank: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الطلبات' },
      { status: 500 }
    );
  }
}
