import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const banks = await db.bank.findMany({
      where: { isActive: true },
      orderBy: { nameAr: 'asc' },
    });
    
    return NextResponse.json({ success: true, banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب قائمة المصارف' },
      { status: 500 }
    );
  }
}
