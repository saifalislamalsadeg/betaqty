# 📖 دليل نشر مشروع بطاقتي على Vercel

## ⚠️ مهم: SQLite لا يعمل على Vercel!

SQLite يعتمد على نظام الملفات المحلي، ولا يعمل على Vercel لأنه Serverless.

**الحلول المتاحة:**
- ✅ **PostgreSQL** (موصى به) - Vercel Postgres, Neon, Supabase
- ✅ **MySQL** - PlanetScale

---

## 🗂️ الملفات المُرفقة

| الملف | الاستخدام |
|-------|----------|
| `prisma/schema.prisma` | PostgreSQL (افتراضي للإنتاج) |
| `prisma/schema.mysql.prisma` | MySQL |
| `prisma/schema.sqlite.prisma` | SQLite (تطوير محلي فقط) |
| `.env.example` | PostgreSQL |
| `.env.sqlite` | SQLite |
| `.env.mysql` | MySQL |

---

## 🚀 الطريقة الأولى: Vercel Postgres (الأسهل)

### الخطوة 1: رفع المشروع لـ GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/bitaqati.git
git push -u origin main
```

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
4. ✅ ستُضاف `DATABASE_URL` تلقائيًا!

### الخطوة 5: إضافة متغيرات البيئة المتبقية
في **Settings** > **Environment Variables**:
```
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-project.vercel.app
```

### الخطوة 6: إعادة النشر
1. اذهب لصفحة **Deployments**
2. اضغط على أحدث deployment
3. اضغط **Redeploy**

### الخطوة 7: تحميل البيانات الأولية
افتح: `https://your-project.vercel.app/seed`

---

## 🌟 الطريقة الثانية: Neon (PostgreSQL مجاني)

### 1. إنشاء حساب Neon
1. اذهب إلى [neon.tech](https://neon.tech)
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد

### 2. نسخ رابط قاعدة البيانات
1. من Dashboard، انسخ **Connection string**
2. شكله: `postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require`

### 3. إضافة متغيرات في Vercel
```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-project.vercel.app
```

---

## 🌟 الطريقة الثالثة: PlanetScale (MySQL مجاني)

### 1. تغيير الـ Schema
```bash
cp prisma/schema.mysql.prisma prisma/schema.prisma
```

### 2. إنشاء حساب PlanetScale
1. اذهب إلى [planetscale.com](https://planetscale.com)
2. أنشئ حساب مجاني
3. أنشئ قاعدة بيانات

### 3. الحصول على Connection String
1. اذهب لقاعدة البيانات > **Connect** > **Connect with**
2. اختر **Prisma**
3. انسخ `DATABASE_URL`

### 4. إضافة متغيرات في Vercel
```
DATABASE_URL=mysql://user:password@host/db?sslaccept=strict
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-project.vercel.app
```

---

## 💻 التطوير المحلي

### مع SQLite:
```bash
# استخدم schema SQLite
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# استخدم .env.sqlite
cp .env.sqlite .env

# شغّل
bun install
bun run db:push
bun run dev
```

### مع PostgreSQL:
```bash
# استخدم .env.example
cp .env.example .env

# عدّل DATABASE_URL لقاعدتك
# شغّل
bun install
bun run db:push
bun run dev
```

---

## 🔐 بيانات المدير
- اسم المستخدم: `admin`
- كلمة المرور: `admin123`

## 📞 الدعم
support@bitaqati.ly
