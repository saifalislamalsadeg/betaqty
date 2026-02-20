'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  CreditCard,
  Building2,
  User,
  Hash,
  Phone,
  ArrowRight,
  Check,
  Loader2,
  Download,
  Share2,
  Copy,
  Settings,
  BarChart3,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  Sparkles,
  Wallet,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BankCard } from '@/components/bank-card/BankCard';
import { BankSelector } from '@/components/forms/BankSelector';
import { ReceiptUpload } from '@/components/forms/ReceiptUpload';
import { AdminPanel } from '@/components/admin/AdminPanel';

// أنواع البيانات
interface Bank {
  id: string;
  name: string;
  nameAr: string;
  primaryColor: string;
  secondaryColor: string;
  cardGradient?: string;
  textColor: string;
  hasOnePay: boolean;
  customIcon?: string | null;
}

interface CardData {
  id: string;
  token: string;
  accountName: string;
  accountNumber: string;
  phoneNumber: string;
  paymentStatus: 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED';
  isActivated: boolean;
  receiptImage?: string | null;
  bank: Bank;
  expiresAt: string;
  notes?: string | null;
}

interface Settings {
  payment_account_name: string;
  payment_account_number: string;
  payment_bank: string;
  card_price: string;
  card_validity_days: string;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  paymentTitle: string;
  completedTitle: string;
  footerText: string;
  showFooterYear: boolean;
  showOnePayBadge: boolean;
  watermarkText: string;
  watermarkEnabled: boolean;
}

export default function HomePage() {
  const { toast } = useToast();
  
  // حالات التطبيق
  const [step, setStep] = useState<'select-bank' | 'fill-info' | 'payment' | 'upload-receipt' | 'waiting' | 'completed'>('select-bank');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  
  // بيانات النموذج
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // للمعاينة المباشرة
  const [previewData, setPreviewData] = useState({
    accountName: '',
    accountNumber: '',
    phoneNumber: '',
  });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  
  // حالة لوحة التحكم
  const [showAdmin, setShowAdmin] = useState(false);
  
  // حالة رابط البطاقة
  const [urlToken, setUrlToken] = useState<string | null>(null);

  // التحقق من وجود token في الرابط
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('card');
    if (token) {
      setUrlToken(token);
      fetchCardByToken(token);
    } else {
      fetchInitialData();
    }
  }, []);

  // جلب البيانات الأولية
  const fetchInitialData = async () => {
    try {
      const [banksRes, settingsRes] = await Promise.all([
        fetch('/api/banks'),
        fetch('/api/settings'),
      ]);
      
      const banksData = await banksRes.json();
      const settingsData = await settingsRes.json();
      
      if (banksData.success) setBanks(banksData.banks);
      if (settingsData.success) {
        setSettings(settingsData.settings);
        if (settingsData.siteSettings) {
          setSiteSettings(settingsData.siteSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب البطاقة بالـ token
  const fetchCardByToken = async (token: string) => {
    try {
      const response = await fetch(`/api/cards?token=${token}`);
      const data = await response.json();
      
      if (data.success) {
        setCardData(data.card);
        setSelectedBank(data.card.bank);
        setAccountName(data.card.accountName);
        setAccountNumber(data.card.accountNumber);
        setPhoneNumber(data.card.phoneNumber);
        
        if (data.card.isActivated) {
          setStep('completed');
        } else if (data.card.paymentStatus === 'UPLOADED') {
          setStep('waiting');
        } else if (data.card.paymentStatus === 'REJECTED') {
          setStep('upload-receipt');
        }
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'البطاقة غير موجودة',
          variant: 'destructive',
        });
        fetchInitialData();
      }
    } catch (error) {
      console.error('Error fetching card:', error);
      fetchInitialData();
    } finally {
      setLoading(false);
    }
  };

  // تحديث المعاينة المباشرة
  useEffect(() => {
    setPreviewData({
      accountName,
      accountNumber,
      phoneNumber,
    });
  }, [accountName, accountNumber, phoneNumber]);

  // إنشاء بطاقة جديدة
  const handleCreateCard = async () => {
    if (!selectedBank || !accountName || !accountNumber || !phoneNumber) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankId: selectedBank.id,
          accountName,
          accountNumber,
          phoneNumber,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCardData(data.card);
        setStep('payment');
        
        // تحديث الرابط
        const url = new URL(window.location.href);
        url.searchParams.set('card', data.card.token);
        window.history.replaceState({}, '', url.toString());
      } else {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل في إنشاء البطاقة',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء البطاقة',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // رفع الإيصال بنجاح
  const handleUploadSuccess = (imageUrl: string) => {
    toast({
      title: 'تم الرفع بنجاح',
      description: 'سيتم مراجعة الإيصال خلال 24 ساعة',
    });
    
    if (cardData) {
      setCardData({
        ...cardData,
        receiptImage: imageUrl,
        paymentStatus: 'UPLOADED',
      });
    }
    setStep('waiting');
  };

  // خطأ في الرفع
  const handleUploadError = (error: string) => {
    toast({
      title: 'خطأ',
      description: error,
      variant: 'destructive',
    });
  };

  // تحميل البطاقة كصورة
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
      });
      
      const link = document.createElement('a');
      link.download = `bank-card-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: 'تم التحميل',
        description: 'تم تحميل البطاقة بنجاح',
      });
    } catch (error) {
      console.error('Error downloading card:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البطاقة',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  // نسخ رابط البطاقة
  const handleCopyLink = () => {
    const url = `${window.location.origin}?card=${cardData?.token}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ رابط البطاقة',
    });
  };

  // المشاركة
  const handleShare = async () => {
    const url = `${window.location.origin}?card=${cardData?.token}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'بطاقتي المصرفية',
          text: `بطاقة معلومات الحساب المصرفي - ${selectedBank?.nameAr}`,
          url,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // لوحة التحكم - محمية بتسجيل الدخول
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <AdminPanel />
        </div>
      </div>
    );
  }

  // عرض البطاقة من الرابط
  if (urlToken && cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{siteSettings?.siteName || 'بطاقتي'}</h1>
                <p className="text-xs text-gray-500">{siteSettings?.siteDescription || 'بطاقة معلومات مصرفية'}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => setShowAdmin(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto">
            {cardData.isActivated ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">{siteSettings?.completedTitle || 'بطاقتك جاهزة!'}</h2>
                  <p className="text-gray-500">يمكنك الآن تحميلها أو مشاركتها</p>
                </div>

                {/* البطاقة */}
                <div className="flex justify-center">
                  <BankCard
                    ref={cardRef}
                    bank={selectedBank!}
                    accountName={accountName}
                    accountNumber={accountNumber}
                    phoneNumber={phoneNumber}
                    showQR={true}
                    isPaid={cardData?.isActivated || false}
                    watermarkText={siteSettings?.watermarkText}
                    watermarkEnabled={siteSettings?.watermarkEnabled}
                    showOnePayBadge={siteSettings?.showOnePayBadge}
                  />
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadCard}
                    disabled={downloading}
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600"
                  >
                    {downloading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5 ml-2" />
                        تحميل البطاقة
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex-1 h-12" onClick={handleShare}>
                    <Share2 className="w-5 h-5 ml-2" />
                    مشاركة
                  </Button>
                </div>

                {/* معلومات إضافية */}
                <Card className="bg-blue-50 border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-700">صلاحية الرابط</p>
                        <p className="text-sm text-blue-600">
                          ينتهي في {new Date(cardData.expiresAt).toLocaleDateString('ar-LY')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  {cardData.paymentStatus === 'UPLOADED' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-bold text-blue-600">بانتظار المراجعة</h2>
                      <p className="text-gray-500">يتم مراجعة الإيصال خلال 24 ساعة</p>
                    </>
                  ) : cardData.paymentStatus === 'REJECTED' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">✕</span>
                      </div>
                      <h2 className="text-2xl font-bold text-red-600">تم رفض الإيصال</h2>
                      <p className="text-gray-500">{cardData.notes || 'يرجى رفع إيصال جديد'}</p>
                    </>
                  ) : null}
                </div>

                {/* معاينة البطاقة */}
                <div className="flex justify-center">
                  <BankCard
                    bank={selectedBank!}
                    accountName={accountName}
                    accountNumber={accountNumber}
                    phoneNumber={phoneNumber}
                    showQR={false}
                    isPreview
                    isPaid={false}
                    watermarkText={siteSettings?.watermarkText}
                    watermarkEnabled={siteSettings?.watermarkEnabled}
                    showOnePayBadge={siteSettings?.showOnePayBadge}
                  />
                </div>

                {(cardData.paymentStatus === 'PENDING' || cardData.paymentStatus === 'REJECTED') && (
                  <ReceiptUpload
                    cardToken={cardData.token}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            {siteSettings?.footerText || 'جميع الحقوق محفوظة'}{siteSettings?.showFooterYear !== false && ` © ${new Date().getFullYear()}`} - {siteSettings?.siteName || 'بطاقتي'}
          </div>
        </footer>
      </div>
    );
  }

  // التطبيق الرئيسي
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">بطاقتي</h1>
              <p className="text-xs text-gray-500">بطاقة معلومات مصرفية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdmin(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* خطوات التقدم */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              {['select-bank', 'fill-info', 'payment', 'upload-receipt', 'waiting', 'completed'].map((s, i) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s
                        ? 'bg-primary text-white scale-110'
                        : ['payment', 'upload-receipt', 'waiting', 'completed'].indexOf(step) > i
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 5 && (
                    <div
                      className={`w-8 h-1 rounded transition-all ${
                        ['payment', 'upload-receipt', 'waiting', 'completed'].indexOf(step) > i
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* الخطوة 1: اختيار المصرف */}
          {step === 'select-bank' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{siteSettings?.welcomeTitle || 'اختر مصرفك'}</h2>
                <p className="text-gray-500">{siteSettings?.welcomeSubtitle || 'حدد المصرف الذي تريد إنشاء بطاقة له'}</p>
              </div>

              <BankSelector
                banks={banks}
                selectedBank={selectedBank}
                onSelect={(bank) => {
                  setSelectedBank(bank);
                  // الانتقال التلقائي للخطوة التالية
                  setTimeout(() => setStep('fill-info'), 300);
                }}
              />
            </div>
          )}

          {/* الخطوة 2: إدخال البيانات */}
          {step === 'fill-info' && selectedBank && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* النموذج */}
              <div className="space-y-6">
                <div className="text-center md:text-right">
                  <h2 className="text-2xl font-bold mb-2">أدخل بياناتك</h2>
                  <p className="text-gray-500">أدخل معلومات حسابك المصرفي</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        اسم صاحب الحساب
                      </Label>
                      <Input
                        id="accountName"
                        placeholder="الاسم الكامل كما يظهر في الحساب"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        رقم الحساب
                      </Label>
                      <Input
                        id="accountNumber"
                        placeholder="أدخل رقم الحساب"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="h-12 font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        رقم الهاتف للتواصل
                      </Label>
                      <Input
                        id="phoneNumber"
                        placeholder="09XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-12 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep('select-bank')}
                  >
                    <ChevronRight className="w-5 h-5 ml-2" />
                    السابق
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                    onClick={handleCreateCard}
                    disabled={submitting || !accountName || !accountNumber || !phoneNumber}
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        إنشاء البطاقة
                        <ChevronLeft className="w-5 h-5 mr-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* المعاينة المباشرة */}
              <div className="space-y-4">
                <div className="text-center md:text-right">
                  <h3 className="text-lg font-semibold flex items-center justify-center md:justify-start gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    معاينة البطاقة
                  </h3>
                </div>

                <div className="flex justify-center">
                  <BankCard
                    bank={selectedBank}
                    accountName={previewData.accountName || 'الاسم هنا'}
                    accountNumber={previewData.accountNumber || '0000000000'}
                    phoneNumber={previewData.phoneNumber || '09XXXXXXXX'}
                    showQR={!!previewData.accountNumber}
                    isPreview
                    isPaid={false}
                    watermarkText={siteSettings?.watermarkText}
                    watermarkEnabled={siteSettings?.watermarkEnabled}
                    showOnePayBadge={siteSettings?.showOnePayBadge}
                  />
                </div>

                {/* ميزات البطاقة */}
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">مميزات بطاقتك</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        تصميم احترافي بهوية المصرف
                      </li>
                      <li className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-blue-500" />
                        رمز QR للسحب السريع
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        حماية متقدمة للبيانات
                      </li>
                      <li className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-orange-500" />
                        سهولة المشاركة عبر التطبيقات
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* الخطوة 3: الدفع */}
          {step === 'payment' && settings && cardData && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{siteSettings?.paymentTitle || 'إتمام الدفع'}</h2>
                <p className="text-gray-500">قم بتحويل {settings.card_price} دينار ليبي</p>
              </div>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Wallet className="w-5 h-5" />
                    بيانات التحويل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">اسم المستفيد:</span>
                      <span className="font-semibold">{settings.payment_account_name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">رقم الحساب:</span>
                      <span className="font-mono font-semibold">{settings.payment_account_number}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">المصرف:</span>
                      <span className="font-semibold">{settings.payment_bank}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">المبلغ:</span>
                      <span className="font-bold text-lg text-amber-600">{settings.card_price} د.ل</span>
                    </div>
                  </div>

                  <div className="bg-amber-100 p-4 rounded-xl">
                    <p className="text-sm text-amber-800">
                      ⚠️ يرجى الاحتفاظ بإيصال التحويل لرفعه في الخطوة التالية
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600"
                onClick={() => setStep('upload-receipt')}
              >
                تم التحويل - رفع الإيصال
                <ChevronLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>
          )}

          {/* الخطوة 4: رفع الإيصال */}
          {step === 'upload-receipt' && cardData && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">رفع الإيصال</h2>
                <p className="text-gray-500">ارفع صورة إيصال التحويل للمراجعة</p>
              </div>

              <ReceiptUpload
                cardToken={cardData.token}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />

              {/* رابط البطاقة */}
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-700 mb-2">
                    🔗 احفظ هذا الرابط للوصول لبطاقتك لاحقاً:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}?card=${cardData.token}`}
                      readOnly
                      className="bg-white text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* الخطوة 5: الانتظار */}
          {step === 'waiting' && cardData && (
            <div className="max-w-lg mx-auto space-y-6 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-blue-600">بانتظار المراجعة</h2>
              <p className="text-gray-500">
                يتم مراجعة الإيصال خلال 24 ساعة عمل
                <br />
                ستتلقى إشعاراً عند الموافقة
              </p>

              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-3">رابط بطاقتك:</p>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}?card=${cardData.token}`}
                      readOnly
                      className="bg-white text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* الخطوة 6: مكتمل */}
          {step === 'completed' && selectedBank && cardData && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600">بطاقتك جاهزة!</h2>
                <p className="text-gray-500">يمكنك الآن تحميلها أو مشاركتها مع عملائك</p>
              </div>

              {/* البطاقة */}
              <div className="flex justify-center">
                <BankCard
                  ref={cardRef}
                  bank={selectedBank}
                  accountName={accountName}
                  accountNumber={accountNumber}
                  phoneNumber={phoneNumber}
                  showQR={true}
                  isPaid={cardData?.isActivated || false}
                  watermarkText={siteSettings?.watermarkText}
                  watermarkEnabled={siteSettings?.watermarkEnabled}
                  showOnePayBadge={siteSettings?.showOnePayBadge}
                />
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadCard}
                  disabled={downloading}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5 ml-2" />
                      تحميل البطاقة
                    </>
                  )}
                </Button>
                <Button variant="outline" className="flex-1 h-12" onClick={handleShare}>
                  <Share2 className="w-5 h-5 ml-2" />
                  مشاركة
                </Button>
              </div>

              {/* رابط البطاقة */}
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-700 mb-2">🔗 رابط بطاقتك:</p>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}?card=${cardData.token}`}
                      readOnly
                      className="bg-white text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          {siteSettings?.footerText || 'جميع الحقوق محفوظة'}{siteSettings?.showFooterYear !== false && ` © ${new Date().getFullYear()}`} - {siteSettings?.siteName || 'بطاقتي'}
        </div>
      </footer>
    </div>
  );
}
