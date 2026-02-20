import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cardToken = formData.get('cardToken') as string;
    
    if (!file || !cardToken) {
      return NextResponse.json(
        { success: false, error: 'الملف والرمز مطلوبان' },
        { status: 400 }
      );
    }
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'يجب أن يكون الملف صورة' },
        { status: 400 }
      );
    }
    
    // التحقق من حجم الملف (أقصى 2 ميجابايت لتخزين base64)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف يجب أن لا يتجاوز 2 ميجابايت' },
        { status: 400 }
      );
    }
    
    // التحقق من وجود البطاقة
    const card = await db.card.findUnique({
      where: { token: cardToken },
    });
    
    if (!card) {
      return NextResponse.json(
        { success: false, error: 'البطاقة غير موجودة' },
        { status: 404 }
      );
    }
    
    // تحويل الصورة إلى base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    // تحديث البطاقة بصورة base64
    const updatedCard = await db.card.update({
      where: { token: cardToken },
      data: {
        receiptImage: base64,
        receiptUploadedAt: new Date(),
        paymentStatus: 'UPLOADED',
      },
    });
    
    return NextResponse.json({
      success: true,
      receiptImage: base64.substring(0, 50) + '...',
      message: 'تم رفع الإيصال بنجاح',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    console.error('Error uploading receipt:', error);
    return NextResponse.json(
      { success: false, error: `فشل في رفع الإيصال: ${errorMessage}` },
      { status: 500 }
    );
  }
}
