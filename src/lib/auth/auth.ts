import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const key = new TextEncoder().encode(SECRET_KEY);

// مدة صلاحية الجلسة (24 ساعة)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export interface AdminSession {
  id: string;
  username: string;
  name: string;
}

// تشفير كلمة المرور
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// التحقق من كلمة المرور
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// إنشاء JWT Token
export async function createSession(admin: AdminSession): Promise<string> {
  const token = await new SignJWT({ 
    id: admin.id, 
    username: admin.username, 
    name: admin.name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
  
  return token;
}

// التحقق من JWT Token
export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

// الحصول على الجلسة الحالية
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) return null;
  
  return verifySession(token);
}

// التحقق من المصادقة (للاستخدام في API)
export async function verifyAuth(): Promise<{ authenticated: boolean; admin?: AdminSession }> {
  const session = await getSession();
  
  if (!session) {
    return { authenticated: false };
  }
  
  return { authenticated: true, admin: session };
}

// تسجيل الدخول
export async function login(username: string, password: string): Promise<{ success: boolean; error?: string; admin?: AdminSession }> {
  const admin = await db.admin.findUnique({
    where: { username },
  });
  
  if (!admin) {
    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  }
  
  if (!admin.isActive) {
    return { success: false, error: 'الحساب غير مفعل' };
  }
  
  const isValid = await verifyPassword(password, admin.password);
  
  if (!isValid) {
    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  }
  
  const session: AdminSession = {
    id: admin.id,
    username: admin.username,
    name: admin.name || admin.username,
  };
  
  const token = await createSession(session);
  
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
  
  return { success: true, admin: session };
}

// تسجيل الخروج
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

// إنشاء حساب مدير افتراضي
export async function createDefaultAdmin(username: string, password: string): Promise<void> {
  const existingAdmin = await db.admin.findUnique({
    where: { username },
  });
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword(password);
    await db.admin.create({
      data: {
        username,
        password: hashedPassword,
        name: 'المدير',
      },
    });
  }
}
