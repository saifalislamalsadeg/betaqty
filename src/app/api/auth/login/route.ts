import { NextResponse } from 'next/server';
import { login, createDefaultAdmin } from '@/lib/auth/auth';

// إنشاء حساب مدير افتراضي عند بدء التشغيل
// username: admin, password: admin123
createDefaultAdmin('admin', 'admin123');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }
    
    const result = await login(username, password);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      admin: result.admin,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
