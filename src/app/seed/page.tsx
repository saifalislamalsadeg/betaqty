'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Check, Loader2, AlertCircle, Building2, Settings, User } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    banks: number;
    settings: number;
    admins: number;
    needsSeed: boolean;
  } | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      banksAdded: number;
      settingsAdded: number;
      adminCreated: boolean;
      totalBanks: number;
    };
  } | null>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const runSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setStatus({
          banks: data.details.totalBanks,
          settings: 5,
          admins: 1,
          needsSeed: false,
        });
      }
    } catch (error) {
      console.error('Seed error:', error);
      setResult({
        success: false,
        message: 'حدث خطأ في الاتصال',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Database className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">تحميل البيانات الأساسية</CardTitle>
          <CardDescription>
            إضافة المصارف الليبية والإعدادات الافتراضية
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* الحالة الحالية */}
          {status && (
            <div className="bg-slate-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-sm">المصارف:</span>
                </div>
                <span className="font-bold">{status.banks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span className="text-sm">الإعدادات:</span>
                </div>
                <span className="font-bold">{status.settings}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-sm">المديرون:</span>
                </div>
                <span className="font-bold">{status.admins}</span>
              </div>
            </div>
          )}

          {/* النتيجة */}
          {result && (
            <div className={`p-4 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="font-bold">{result.message}</span>
                  </div>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>✅ تم إضافة {result.details?.banksAdded} مصرف</li>
                    <li>✅ تم إضافة {result.details?.settingsAdded} إعداد</li>
                    {result.details?.adminCreated && <li>✅ تم إنشاء حساب المدير</li>}
                    <li>📊 إجمالي المصارف: {result.details?.totalBanks}</li>
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{result.message}</span>
                </div>
              )}
            </div>
          )}

          {/* زر التحميل */}
          <Button
            onClick={runSeed}
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin ml-2" />
                جاري التحميل...
              </>
            ) : (
              <>
                <Database className="w-6 h-6 ml-2" />
                تحميل البيانات
              </>
            )}
          </Button>

          {/* معلومات */}
          <div className="text-xs text-gray-500 text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-700 mb-1">📌 ملاحظة:</p>
            <p>سيتم إضافة 12 مصرف ليبي + الإعدادات + حساب المدير</p>
            <p className="mt-1 text-amber-600">
              🔑 بيانات المدير: admin / admin123
            </p>
          </div>

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
