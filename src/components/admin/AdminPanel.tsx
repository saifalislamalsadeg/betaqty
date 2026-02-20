'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Check,
  X,
  Clock,
  Upload,
  CheckCircle,
  XCircle,
  BarChart3,
  Loader2,
  Eye,
  Building2,
  Phone,
  Hash,
  User,
  Calendar,
  Lock,
  LogOut,
  AlertCircle,
  Settings,
  Palette,
  CreditCard,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// أنواع البيانات
interface CardData {
  id: string;
  token: string;
  accountName: string;
  accountNumber: string;
  phoneNumber: string;
  paymentStatus: 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED';
  isActivated: boolean;
  receiptImage: string | null;
  notes: string | null;
  createdAt: string;
  expiresAt: string;
  bank: {
    id: string;
    nameAr: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

interface Stats {
  total: number;
  pending: number;
  uploaded: number;
  approved: number;
  rejected: number;
}

interface AdminInfo {
  id: string;
  username: string;
  name: string;
}

interface Bank {
  id: string;
  name: string;
  nameAr: string;
  primaryColor: string;
  secondaryColor: string;
  cardGradient?: string;
  textColor: string;
  hasOnePay: boolean;
  isActive: boolean;
  customIcon?: string | null;
}

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  headerBgColor: string;
  footerBgColor: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  paymentTitle: string;
  completedTitle: string;
  footerText: string;
  showFooterYear: boolean;
  showOnePayBadge: boolean;
  cardPrice: string;
  cardValidityDays: string;
  paymentAccountName: string;
  paymentAccountNumber: string;
  paymentBank: string;
  watermarkText: string;
  watermarkEnabled: boolean;
}

// مكون تسجيل الدخول
function LoginForm({ onLogin }: { onLogin: (admin: AdminInfo) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.admin);
      } else {
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات المدير للوصول للوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 ml-2" />
                  دخول
                </>
              )}
            </Button>
            

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// مكون إدارة المصارف
function BanksManager() {
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBanks = async () => {
    try {
      const response = await fetch('/api/admin/banks');
      const data = await response.json();
      if (data.success) setBanks(data.banks);
    } catch (error) {
      console.error('Error fetching banks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSave = async (bankData: Partial<Bank>) => {
    setSaving(true);
    try {
      const url = '/api/admin/banks';
      const method = editingBank?.id ? 'PUT' : 'POST';
      const body = editingBank?.id 
        ? { ...bankData, id: editingBank.id }
        : bankData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'تم الحفظ بنجاح' });
        setShowDialog(false);
        setEditingBank(null);
        fetchBanks();
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving bank:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصرف؟')) return;
    
    try {
      const response = await fetch(`/api/admin/banks?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'تم الحذف بنجاح' });
        fetchBanks();
      }
    } catch (error) {
      console.error('Error deleting bank:', error);
    }
  };

  if (loading) {
    return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">إدارة المصارف ({banks.length})</h3>
        <Button onClick={() => { setEditingBank(null); setShowDialog(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة مصرف
        </Button>
      </div>

      <div className="grid gap-3">
        {banks.map((bank) => (
          <Card key={bank.id} className={!bank.isActive ? 'opacity-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden"
                    style={{
                      background: bank.cardGradient || `linear-gradient(135deg, ${bank.primaryColor} 0%, ${bank.secondaryColor} 100%)`,
                    }}
                  >
                    {bank.customIcon ? (
                      <img src={bank.customIcon} alt={bank.nameAr} className="w-8 h-8 object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{bank.nameAr}</p>
                    <p className="text-sm text-gray-500">{bank.name}</p>
                  </div>
                  {bank.hasOnePay && (
                    <Badge variant="secondary">ONEPAY</Badge>
                  )}
                  {!bank.isActive && (
                    <Badge variant="destructive">معطل</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingBank(bank); setShowDialog(true); }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(bank.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* نافذة إضافة/تعديل مصرف */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBank ? 'تعديل مصرف' : 'إضافة مصرف جديد'}</DialogTitle>
          </DialogHeader>
          <BankForm
            bank={editingBank}
            onSave={handleSave}
            saving={saving}
            onCancel={() => { setShowDialog(false); setEditingBank(null); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// نموذج إضافة/تعديل مصرف
function BankForm({ bank, onSave, saving, onCancel }: {
  bank: Bank | null;
  onSave: (data: Partial<Bank>) => void;
  saving: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: bank?.name || '',
    nameAr: bank?.nameAr || '',
    primaryColor: bank?.primaryColor || '#1B5E20',
    secondaryColor: bank?.secondaryColor || '#4CAF50',
    cardGradient: bank?.cardGradient || '',
    textColor: bank?.textColor || '#FFFFFF',
    hasOnePay: bank?.hasOnePay || false,
    isActive: bank?.isActive ?? true,
    customIcon: bank?.customIcon || '',
  });

  // رفع الصورة وتحويلها إلى Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // التحقق من حجم الصورة (أقل من 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({ ...formData, customIcon: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>الاسم بالإنجليزية</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="BankName"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>الاسم بالعربية</Label>
          <Input
            value={formData.nameAr}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
            placeholder="اسم المصرف"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اللون الأساسي</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>اللون الثانوي</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={formData.secondaryColor}
              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>تدرج البطاقة (اختياري)</Label>
        <Input
          value={formData.cardGradient}
          onChange={(e) => setFormData({ ...formData, cardGradient: e.target.value })}
          placeholder="linear-gradient(135deg, #color1 0%, #color2 100%)"
        />
      </div>

      <div className="space-y-2">
        <Label>لون النص</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={formData.textColor}
            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            value={formData.textColor}
            onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>دعم ONEPAY</Label>
        <Switch
          checked={formData.hasOnePay}
          onCheckedChange={(checked) => setFormData({ ...formData, hasOnePay: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>مفعّل</Label>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      {/* أيقونة المصرف */}
      <div className="space-y-2">
        <Label>أيقونة المصرف (اختياري)</Label>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300"
            style={{
              background: formData.cardGradient || `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
            }}
          >
            {formData.customIcon ? (
              <img src={formData.customIcon} alt="أيقونة المصرف" className="w-12 h-12 object-contain" />
            ) : (
              <Building2 className="w-8 h-8" style={{ color: formData.textColor }} />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageUpload}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">PNG, JPG, WebP - أقصى حجم 2MB</p>
            {formData.customIcon && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, customIcon: '' })}
              >
                <X className="w-4 h-4 ml-1" />
                إزالة الصورة
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* معاينة */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <Label className="mb-2 block">معاينة</Label>
        <div
          className="h-20 rounded-xl p-4 flex items-center gap-3"
          style={{
            background: formData.cardGradient || `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)`,
          }}
        >
          {formData.customIcon ? (
            <img src={formData.customIcon} alt="أيقونة المصرف" className="w-10 h-10 object-contain" />
          ) : (
            <Building2 className="w-8 h-8" style={{ color: formData.textColor }} />
          )}
          <div>
            <p className="font-bold" style={{ color: formData.textColor }}>{formData.nameAr || 'اسم المصرف'}</p>
            <p className="text-xs opacity-75" style={{ color: formData.textColor }}>بطاقة معلومات الحساب</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
          حفظ
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

// مكون إعدادات الموقع
function SiteSettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.success) setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'تم حفظ الإعدادات بنجاح' });
      } else {
        toast({ title: 'خطأ', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;
  }

  if (!settings) {
    return <p>لا توجد إعدادات</p>;
  }

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* معلومات الموقع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            معلومات الموقع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم الموقع</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>وصف الموقع</Label>
              <Input
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ألوان الموقع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            ألوان الموقع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>اللون الأساسي</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>اللون الثانوي</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>لون الخلفية (الهيدر)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.headerBgColor}
                  onChange={(e) => updateSetting('headerBgColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.headerBgColor}
                  onChange={(e) => updateSetting('headerBgColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>لون الخلفية (الفوتر)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.footerBgColor}
                  onChange={(e) => updateSetting('footerBgColor', e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={settings.footerBgColor}
                  onChange={(e) => updateSetting('footerBgColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نصوص الواجهة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            نصوص الواجهة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان الترحيب</Label>
              <Input
                value={settings.welcomeTitle}
                onChange={(e) => updateSetting('welcomeTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>نص الترحيب</Label>
              <Input
                value={settings.welcomeSubtitle}
                onChange={(e) => updateSetting('welcomeSubtitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>عنوان الدفع</Label>
              <Input
                value={settings.paymentTitle}
                onChange={(e) => updateSetting('paymentTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>عنوان الإكمال</Label>
              <Input
                value={settings.completedTitle}
                onChange={(e) => updateSetting('completedTitle', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إعدادات البطاقة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            إعدادات البطاقة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>سعر البطاقة (د.ل)</Label>
              <Input
                type="number"
                value={settings.cardPrice}
                onChange={(e) => updateSetting('cardPrice', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>صلاحية الرابط (أيام)</Label>
              <Input
                type="number"
                value={settings.cardValidityDays}
                onChange={(e) => updateSetting('cardValidityDays', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>إظهار شارة ONEPAY</Label>
            <Switch
              checked={settings.showOnePayBadge}
              onCheckedChange={(checked) => updateSetting('showOnePayBadge', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* إعدادات الدفع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            بيانات التحويل
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>اسم المستفيد</Label>
              <Input
                value={settings.paymentAccountName}
                onChange={(e) => updateSetting('paymentAccountName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الحساب</Label>
              <Input
                value={settings.paymentAccountNumber}
                onChange={(e) => updateSetting('paymentAccountNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>المصرف</Label>
              <Input
                value={settings.paymentBank}
                onChange={(e) => updateSetting('paymentBank', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* العلامة المائية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            العلامة المائية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>تفعيل العلامة المائية</Label>
            <Switch
              checked={settings.watermarkEnabled}
              onCheckedChange={(checked) => updateSetting('watermarkEnabled', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>نص العلامة المائية</Label>
            <Input
              value={settings.watermarkText}
              onChange={(e) => updateSetting('watermarkText', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* التذييل */}
      <Card>
        <CardHeader>
          <CardTitle>التذييل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>نص التذييل</Label>
            <Input
              value={settings.footerText}
              onChange={(e) => updateSetting('footerText', e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>إظهار السنة</Label>
            <Switch
              checked={settings.showFooterYear}
              onCheckedChange={(checked) => updateSetting('showFooterYear', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-12">
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Save className="w-4 h-4 ml-2" />
            حفظ جميع الإعدادات
          </>
        )}
      </Button>
    </div>
  );
}

// مكون إدارة الطلبات
function RequestsManager() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchData = async () => {
    try {
      const [cardsRes, statsRes] = await Promise.all([
        fetch(`/api/admin?status=${activeTab === 'ALL' ? '' : activeTab}`),
        fetch('/api/admin/stats'),
      ]);
      
      const cardsData = await cardsRes.json();
      const statsData = await statsRes.json();
      
      if (cardsData.success) setCards(cardsData.cards);
      if (statsData.success) setStats(statsData.stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAction = async () => {
    if (!selectedCard || !actionDialog) return;
    
    setProcessing(true);
    
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard.id,
          action: actionDialog,
          notes: notes || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchData();
        setActionDialog(null);
        setSelectedCard(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case 'UPLOADED':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Upload className="w-3 h-3 mr-1" />
            تم الرفع
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            مقبول
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredCards = activeTab === 'ALL' 
    ? cards 
    : cards.filter(card => card.paymentStatus === activeTab);

  if (loading) {
    return <Loader2 className="w-8 h-8 animate-spin mx-auto" />;
  }

  return (
    <div className="space-y-4">
      {/* الإحصائيات */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
            <p className="text-xs text-gray-500">الإجمالي</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats?.pending || 0}</p>
            <p className="text-xs text-gray-500">انتظار</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats?.uploaded || 0}</p>
            <p className="text-xs text-gray-500">مراجعة</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats?.approved || 0}</p>
            <p className="text-xs text-gray-500">مقبولة</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats?.rejected || 0}</p>
            <p className="text-xs text-gray-500">مرفوضة</p>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الطلبات */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="ALL">الكل</TabsTrigger>
              <TabsTrigger value="PENDING">انتظار</TabsTrigger>
              <TabsTrigger value="UPLOADED">مراجعة</TabsTrigger>
              <TabsTrigger value="APPROVED">مقبولة</TabsTrigger>
              <TabsTrigger value="REJECTED">مرفوضة</TabsTrigger>
            </TabsList>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500">لا توجد طلبات</div>
              ) : (
                filteredCards.map((card) => (
                  <Card key={card.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{
                              background: `linear-gradient(135deg, ${card.bank.primaryColor} 0%, ${card.bank.secondaryColor} 100%)`,
                            }}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{card.accountName}</p>
                            <p className="text-xs text-gray-500">{card.bank.nameAr}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(card.paymentStatus)}
                          {card.receiptImage && (
                            <Button size="sm" variant="outline" onClick={() => setSelectedCard(card)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* نافذة المراجعة */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle>مراجعة الطلب</DialogTitle>
          </DialogHeader>
          
          {selectedCard && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold">{selectedCard.accountName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-mono">{selectedCard.accountNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{selectedCard.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{selectedCard.bank.nameAr}</span>
                </div>
              </div>
              
              {selectedCard.receiptImage && (
                <img
                  src={selectedCard.receiptImage}
                  alt="الإيصال"
                  className="w-full rounded-xl border max-h-[40vh] object-contain"
                />
              )}
              
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظات..."
                  rows={2}
                />
              </div>
            </div>
          )}
          
          <div className="p-6 pt-4 border-t bg-gray-50 shrink-0">
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => setActionDialog('approve')}
              >
                <Check className="w-4 h-4 ml-2" />
                قبول
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setActionDialog('reject')}
              >
                <X className="w-4 h-4 ml-2" />
                رفض
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{actionDialog === 'approve' ? 'تأكيد القبول' : 'تأكيد الرفض'}</DialogTitle>
            <DialogDescription>
              {actionDialog === 'approve'
                ? 'هل أنت متأكد من قبول هذا الطلب؟'
                : 'هل أنت متأكد من رفض هذا الطلب؟'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>إلغاء</Button>
            <Button
              className={actionDialog === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تأكيد'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// مكون لوحة التحكم الرئيسية
function AdminDashboard({ admin, onLogout }: { admin: AdminInfo; onLogout: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('requests');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* رأس لوحة التحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-500">مرحباً، {admin.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/')}>
            العودة للتطبيق
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>
      </div>

      {/* التبويبات */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">
            <BarChart3 className="w-4 h-4 ml-2" />
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="banks">
            <Building2 className="w-4 h-4 ml-2" />
            المصارف
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 ml-2" />
            الإعدادات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <RequestsManager />
        </TabsContent>
        <TabsContent value="banks" className="mt-6">
          <BanksManager />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <SiteSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// المكون الرئيسي
export function AdminPanel() {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.authenticated) {
          setAdmin(data.admin);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setChecking(false);
      }
    };
    
    checkSession();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return <LoginForm onLogin={setAdmin} />;
  }

  return <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} />;
}
