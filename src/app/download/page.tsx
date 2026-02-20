'use client';

import { useState } from 'react';
import { Download, FileArchive, Check, Loader2, Folder, FileCode, FileText, Database, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const response = await fetch('/api/download');
      
      if (!response.ok) {
        throw new Error('فشل في التنزيل');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitaqati-project-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloaded(true);
    } catch (error) {
      console.error('Download error:', error);
      alert('حدث خطأ أثناء التنزيل');
    } finally {
      setDownloading(false);
    }
  };

  const files = [
    { name: 'src/', icon: Folder, desc: 'الكود المصدري' },
    { name: 'prisma/', icon: Database, desc: 'قاعدة البيانات' },
    { name: 'schema.prisma', icon: FileCode, desc: 'SQLite (محلي)' },
    { name: 'schema.postgresql.prisma', icon: FileCode, desc: 'PostgreSQL' },
    { name: 'schema.mysql.prisma', icon: FileCode, desc: 'MySQL' },
    { name: '.env.example', icon: Settings, desc: 'PostgreSQL' },
    { name: '.env.mysql', icon: Settings, desc: 'MySQL' },
    { name: '.env.sqlite', icon: Settings, desc: 'SQLite' },
    { name: 'DEPLOY.md', icon: FileText, desc: 'دليل النشر' },
    { name: 'package.json', icon: FileText, desc: 'الحزم' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <FileArchive className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">تحميل المشروع</CardTitle>
          <CardDescription className="text-base">
            بطاقتي - جاهز للنشر على Vercel
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* شارات */}
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              <RefreshCw className="w-3 h-3 ml-1" />
              دائمًا محدث
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              PostgreSQL ✅
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
              MySQL ✅
            </Badge>
          </div>

          {/* معلومات مهمة */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-amber-700 mb-2">⚠️ مهم للنشر على Vercel:</p>
            <ul className="text-amber-600 space-y-1">
              <li>• SQLite لا يعمل على Vercel</li>
              <li>• استخدم PostgreSQL أو MySQL</li>
              <li>• انسخ schema المناسب قبل النشر</li>
            </ul>
          </div>

          {/* خطوات سريعة */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-blue-700 mb-2">🚀 خطوات النشر السريع:</p>
            <ol className="text-blue-600 space-y-1 list-decimal list-inside">
              <li>حمّل المشروع وفك الضغط</li>
              <li>انسخ <code className="bg-blue-100 px-1 rounded">schema.postgresql.prisma</code> إلى <code className="bg-blue-100 px-1 rounded">schema.prisma</code></li>
              <li>ارفع لـ GitHub واربطه بـ Vercel</li>
              <li>أنشئ Vercel Postgres واربطه بالمشروع</li>
            </ol>
          </div>

          {/* محتويات الملف */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">محتويات الملف:</p>
            <div className="grid grid-cols-2 gap-2 text-sm max-h-40 overflow-y-auto">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded-lg">
                  <file.icon className="w-4 h-4 text-primary" />
                  <span className="truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* زر التحميل */}
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full h-14 text-lg font-bold rounded-xl transition-all ${
              downloaded
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
            }`}
          >
            {downloading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin ml-2" />
                جاري إنشاء الملف...
              </>
            ) : downloaded ? (
              <>
                <Check className="w-6 h-6 ml-2" />
                تم التحميل بنجاح!
              </>
            ) : (
              <>
                <Download className="w-6 h-6 ml-2" />
                تحميل المشروع
              </>
            )}
          </Button>

          {/* رابط العودة */}
          <div className="text-center">
            <a href="/" className="text-sm text-primary hover:underline">
              ← العودة للرئيسية
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
