import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth';

// جلب جميع المصارف
export async function GET() {
  try {
    const banks = await db.bank.findMany({
      orderBy: { nameAr: 'asc' }
    });
    
    return NextResponse.json({ success: true, banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المصارف' },
      { status: 500 }
    );
  }
}

// إضافة مصرف جديد
export async function POST(request: Request) {
  try {
    // التحقق من المصادقة
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, nameAr, primaryColor, secondaryColor, cardGradient, textColor, hasOnePay, isActive, customIcon } = body;
    
    if (!name || !nameAr || !primaryColor || !secondaryColor) {
      return NextResponse.json(
        { success: false, error: 'يرجى ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }
    
    const bank = await db.bank.create({
      data: {
        name,
        nameAr,
        logo: `/banks/${name.toLowerCase()}.svg`,
        customIcon,
        primaryColor,
        secondaryColor,
        cardGradient: cardGradient || `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        textColor: textColor || '#FFFFFF',
        hasOnePay: hasOnePay ?? false,
        isActive: isActive ?? true,
      }
    });
    
    return NextResponse.json({ success: true, bank });
  } catch (error) {
    console.error('Error creating bank:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء المصرف' },
      { status: 500 }
    );
  }
}

// تحديث مصرف
export async function PUT(request: Request) {
  try {
    // التحقق من المصادقة
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { id, name, nameAr, primaryColor, secondaryColor, cardGradient, textColor, hasOnePay, isActive, customIcon } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المصرف مطلوب' },
        { status: 400 }
      );
    }
    
    const bank = await db.bank.update({
      where: { id },
      data: {
        name,
        nameAr,
        primaryColor,
        secondaryColor,
        cardGradient,
        textColor,
        hasOnePay,
        isActive,
        customIcon,
      }
    });
    
    return NextResponse.json({ success: true, bank });
  } catch (error) {
    console.error('Error updating bank:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث المصرف' },
      { status: 500 }
    );
  }
}

// حذف مصرف
export async function DELETE(request: Request) {
  try {
    // التحقق من المصادقة
    const authResult = await verifyAuth();
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المصرف مطلوب' },
        { status: 400 }
      );
    }
    
    await db.bank.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المصرف' },
      { status: 500 }
    );
  }
}
