import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth/auth';

// جلب إعدادات الموقع
export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst();
    
    // إنشاء إعدادات افتراضية إذا لم تكن موجودة
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {}
      });
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// تحديث إعدادات الموقع
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
    
    let settings = await db.siteSettings.findFirst();
    
    if (!settings) {
      settings = await db.siteSettings.create({
        data: body
      });
    } else {
      settings = await db.siteSettings.update({
        where: { id: settings.id },
        data: body
      });
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الإعدادات' },
      { status: 500 }
    );
  }
}
