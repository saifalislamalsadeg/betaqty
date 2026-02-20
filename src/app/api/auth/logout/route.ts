import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth/auth';

export async function POST() {
  try {
    await logout();
    
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تسجيل الخروج' },
      { status: 500 }
    );
  }
}
