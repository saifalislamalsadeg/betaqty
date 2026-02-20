import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';

// الملفات والمجلدات المطلوب استبعادها
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '.env',
  '.env.local',
  '.env.production',
  '*.log',
  '*.db',
  '*.db-journal',
  'public/bitaqati-project.zip',
  'public/uploads/receipts/',
];

// التحقق من استبعاد ملف
function shouldExclude(path: string): boolean {
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.startsWith('*')) {
      const ext = pattern.substring(1);
      if (path.endsWith(ext)) return true;
    } else {
      if (path.includes(pattern)) return true;
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const projectRoot = process.cwd();
    
    // إنشاء أرشيف ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // جمع الأخطاء
    const errors: string[] = [];
    
    archive.on('error', (err) => {
      errors.push(err.message);
    });
    
    // ==========================================
    // إضافة ملف .env.example للإنتاج
    // ==========================================
    const envExample = `# ===========================================
# متغيرات البيئة للإنتاج (PostgreSQL)
# ===========================================

# قاعدة البيانات PostgreSQL
# Vercel Postgres يضيف هذه تلقائيًا عند ربط قاعدة البيانات
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"

# مفتاح التشفير (غيّره في الإنتاج!)
# ولّده عبر: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# رابط الموقع
NEXTAUTH_URL="https://your-project.vercel.app"

# بيانات المدير الافتراضية
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
`;
    archive.append(envExample, { name: '.env.example' });
    
    // ==========================================
    // إضافة ملف .env.sqlite للتطوير المحلي
    // ==========================================
    const envSqlite = `# ===========================================
# متغيرات البيئة للتطوير المحلي (SQLite)
# ===========================================

# قاعدة البيانات المحلية
DATABASE_URL="file:./dev.db"

# مفتاح التشفير
NEXTAUTH_SECRET="dev-secret-key"

# رابط الموقع
NEXTAUTH_URL="http://localhost:3000"

# بيانات المدير الافتراضية
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
`;
    archive.append(envSqlite, { name: '.env.sqlite' });

    // ==========================================
    // إضافة ملف .env.mysql
    // ==========================================
    const envMysql = `# ===========================================
# متغيرات البيئة لـ MySQL
# ===========================================

# قاعدة البيانات MySQL
# PlanetScale مثال: mysql://user:password@host/database?sslaccept=strict
DATABASE_URL="mysql://user:password@localhost:3306/bitaqati"

# مفتاح التشفير
NEXTAUTH_SECRET="your-secret-key-here"

# رابط الموقع
NEXTAUTH_URL="http://localhost:3000"

# بيانات المدير الافتراضية
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
`;
    archive.append(envMysql, { name: '.env.mysql' });
    
    // ==========================================
    // إضافة ملف DEPLOY.md
    // ==========================================
    const deployMd = `# 📖 دليل نشر مشروع بطاقتي على Vercel

## ⚠️ مهم: SQLite لا يعمل على Vercel!

SQLite يعتمد على نظام الملفات المحلي، ولا يعمل على Vercel لأنه Serverless.

**الحلول المتاحة:**
- ✅ **PostgreSQL** (موصى به) - Vercel Postgres, Neon, Supabase
- ✅ **MySQL** - PlanetScale

---

## 🗂️ الملفات المُرفقة

| الملف | الاستخدام |
|-------|----------|
| \`prisma/schema.prisma\` | PostgreSQL (افتراضي للإنتاج) |
| \`prisma/schema.mysql.prisma\` | MySQL |
| \`prisma/schema.sqlite.prisma\` | SQLite (تطوير محلي فقط) |
| \`.env.example\` | PostgreSQL |
| \`.env.sqlite\` | SQLite |
| \`.env.mysql\` | MySQL |

---

## 🚀 الطريقة الأولى: Vercel Postgres (الأسهل)

### الخطوة 1: رفع المشروع لـ GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/bitaqati.git
git push -u origin main
\`\`\`

### الخطوة 2: إنشاء مشروع Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **Add New** > **Project**
3. اختر مستودع GitHub
4. اضغط **Import**

### الخطوة 3: إنشاء قاعدة بيانات Postgres
1. في صفحة المشروع، اضغط **Storage**
2. اضغط **Create Database**
3. اختر **Postgres**
4. اضغط **Continue** ثم **Create**

### الخطوة 4: ربط قاعدة البيانات بالمشروع
1. في صفحة قاعدة البيانات
2. اضغط **Connect to Project**
3. اختر مشروعك
4. ✅ ستُضاف \`DATABASE_URL\` تلقائيًا!

### الخطوة 5: إضافة متغيرات البيئة المتبقية
في **Settings** > **Environment Variables**:
\`\`\`
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-project.vercel.app
\`\`\`

### الخطوة 6: إعادة النشر
1. اذهب لصفحة **Deployments**
2. اضغط على أحدث deployment
3. اضغط **Redeploy**

### الخطوة 7: تحميل البيانات الأولية
افتح: \`https://your-project.vercel.app/seed\`

---

## 🌟 الطريقة الثانية: Neon (PostgreSQL مجاني)

### 1. إنشاء حساب Neon
1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد

### 2. نسخ رابط قاعدة البيانات
1. من Dashboard، انسخ **Connection string**
2. شكله: \`postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require\`

### 3. إضافة متغيرات في Vercel
\`\`\`
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-project.vercel.app
\`\`\`

---

## 🌟 الطريقة الثالثة: PlanetScale (MySQL مجاني)

### 1. تغيير الـ Schema
\`\`\`bash
cp prisma/schema.mysql.prisma prisma/schema.prisma
\`\`\`

### 2. إنشاء حساب PlanetScale
1. اذهب إلى [planetscale.com](https://planetscale.com)
2. أنشئ حساب مجاني
3. أنشئ قاعدة بيانات

### 3. الحصول على Connection String
1. اذهب لقاعدة البيانات > **Connect** > **Connect with**
2. اختر **Prisma**
3. انسخ \`DATABASE_URL\`

### 4. إضافة متغيرات في Vercel
\`\`\`
DATABASE_URL=mysql://user:password@host/db?sslaccept=strict
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-project.vercel.app
\`\`\`

---

## 💻 التطوير المحلي

### مع SQLite:
\`\`\`bash
# استخدم schema SQLite
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# استخدم .env.sqlite
cp .env.sqlite .env

# شغّل
bun install
bun run db:push
bun run dev
\`\`\`

### مع PostgreSQL:
\`\`\`bash
# استخدم .env.example
cp .env.example .env

# عدّل DATABASE_URL لقاعدتك
# شغّل
bun install
bun run db:push
bun run dev
\`\`\`

---

## 🔐 بيانات المدير
- اسم المستخدم: \`admin\`
- كلمة المرور: \`admin123\`

## 📞 الدعم
support@bitaqati.ly
`;
    archive.append(deployMd, { name: 'DEPLOY.md' });
    
    // ==========================================
    // دالة لإضافة مجلد
    // ==========================================
    async function addDirectory(dirPath: string, archivePath: string) {
      try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item);
          const archiveItemPath = path.join(archivePath, item);
          const relativePath = path.relative(projectRoot, fullPath).replace(/\\\\/g, '/');
          
          if (shouldExclude(relativePath)) continue;
          
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            await addDirectory(fullPath, archiveItemPath);
          } else {
            const content = fs.readFileSync(fullPath);
            archive.append(content, { name: archiveItemPath });
          }
        }
      } catch (err) {
        // تجاهل الأخطاء للمجلدات غير الموجودة
      }
    }
    
    // إضافة المجلدات الرئيسية
    await addDirectory(path.join(projectRoot, 'src'), 'src');
    await addDirectory(path.join(projectRoot, 'prisma'), 'prisma');
    
    // إضافة المجلد public (بدون receipts وملف zip القديم)
    const publicDir = path.join(projectRoot, 'public');
    try {
      const publicItems = fs.readdirSync(publicDir);
      for (const item of publicItems) {
        if (item === 'bitaqati-project.zip' || item === 'uploads') continue;
        
        const fullPath = path.join(publicDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          await addDirectory(fullPath, `public/${item}`);
        } else {
          const content = fs.readFileSync(fullPath);
          archive.append(content, { name: `public/${item}` });
        }
      }
    } catch (err) {
      // تجاهل الأخطاء
    }
    
    // إضافة الملفات الجذرية
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'postcss.config.mjs',
      'next.config.ts',
      'next.env.d.ts',
      'bun.lock',
      'components.json',
    ];
    
    for (const file of rootFiles) {
      try {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath);
          archive.append(content, { name: file });
        }
      } catch (err) {
        // تجاهل الملفات غير الموجودة
      }
    }
    
    // إنهاء الأرشيف
    archive.finalize();
    
    // تحويل الأرشيف إلى Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of archive) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // إرجاع الملف
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="bitaqati-project-${Date.now()}.zip"`,
        'Content-Length': buffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء ملف التنزيل' },
      { status: 500 }
    );
  }
}
