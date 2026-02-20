import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/auth';

// قبول أو رفض الطلب - يتطلب تسجيل دخول
export async function POST(request: Request) {
  try {
    // التحقق من المصادقة
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { cardId, action, notes } = body;
    
    if (!cardId || !action) {
      return NextResponse.json(
        { success: false, error: 'معرف البطاقة والإجراء مطلوبان' },
        { status: 400 }
      );
    }
    
    const card = await db.card.findUnique({
      where: { id: cardId },
    });
    
    if (!card) {
      return NextResponse.json(
        { success: false, error: 'البطاقة غير موجودة' },
        { status: 404 }
      );
    }
    
    if (action === 'approve') {
      const updatedCard = await db.card.update({
        where: { id: cardId },
        data: {
          paymentStatus: 'APPROVED',
          isActivated: true,
          activatedAt: new Date(),
          activatedBy: session.id,
          notes: notes || null,
        },
      });
      
      // تسجيل العملية
      await db.activityLog.create({
        data: {
          action: 'APPROVE_CARD',
          details: `تمت الموافقة على البطاقة رقم ${card.accountNumber} بواسطة ${session.name}`,
          cardId,
          adminId: session.id,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'تمت الموافقة على الطلب بنجاح',
        card: updatedCard,
      });
    } else if (action === 'reject') {
      const updatedCard = await db.card.update({
        where: { id: cardId },
        data: {
          paymentStatus: 'REJECTED',
          notes: notes || null,
        },
      });
      
      // تسجيل العملية
      await db.activityLog.create({
        data: {
          action: 'REJECT_CARD',
          details: `تم رفض البطاقة رقم ${card.accountNumber} بواسطة ${session.name}. السبب: ${notes || 'غير محدد'}`,
          cardId,
          adminId: session.id,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'تم رفض الطلب',
        card: updatedCard,
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'إجراء غير صالح' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الطلب' },
      { status: 500 }
    );
  }
}
