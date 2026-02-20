import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// توليد رمز فريد
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// إنشاء بطاقة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountName, accountNumber, phoneNumber, bankId } = body;
    
    // التحقق من البيانات
    if (!accountName || !accountNumber || !phoneNumber || !bankId) {
      return NextResponse.json(
        { success: false, error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }
    
    // التحقق من وجود المصرف
    const bank = await db.bank.findUnique({
      where: { id: bankId },
    });
    
    if (!bank) {
      return NextResponse.json(
        { success: false, error: 'المصرف غير موجود' },
        { status: 400 }
      );
    }
    
    // الحصول على عدد أيام الصلاحية
    const validitySetting = await db.setting.findUnique({
      where: { key: 'card_validity_days' },
    });
    
    const validityDays = validitySetting ? parseInt(validitySetting.value) : 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);
    
    // إنشاء البطاقة
    const card = await db.card.create({
      data: {
        token: generateToken(),
        accountName,
        accountNumber,
        phoneNumber,
        bankId,
        expiresAt,
      },
      include: { bank: true },
    });
    
    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        token: card.token,
        accountName: card.accountName,
        accountNumber: card.accountNumber,
        phoneNumber: card.phoneNumber,
        bank: card.bank,
        paymentStatus: card.paymentStatus,
        isActivated: card.isActivated,
        expiresAt: card.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء البطاقة' },
      { status: 500 }
    );
  }
}

// جلب بطاقة بالرمز
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'الرمز مطلوب' },
        { status: 400 }
      );
    }
    
    const card = await db.card.findUnique({
      where: { token },
      include: { bank: true },
    });
    
    if (!card) {
      return NextResponse.json(
        { success: false, error: 'البطاقة غير موجودة' },
        { status: 404 }
      );
    }
    
    // التحقق من صلاحية الرابط
    if (new Date() > card.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'انتهت صلاحية الرابط' },
        { status: 410 }
      );
    }
    
    return NextResponse.json({
      success: true,
      card: {
        id: card.id,
        token: card.token,
        accountName: card.accountName,
        accountNumber: card.accountNumber,
        phoneNumber: card.phoneNumber,
        bank: card.bank,
        paymentStatus: card.paymentStatus,
        isActivated: card.isActivated,
        receiptImage: card.receiptImage,
        expiresAt: card.expiresAt,
        notes: card.notes,
      },
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب البطاقة' },
      { status: 500 }
    );
  }
}
