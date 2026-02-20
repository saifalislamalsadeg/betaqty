import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const libyanBanks = [
  { name: "AlJumhuriya", nameAr: "مصرف الجمهورية", logo: "/banks/aljumhuriya.svg", primaryColor: "#1B5E20", secondaryColor: "#4CAF50", cardGradient: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "AlWahda", nameAr: "مصرف الوحدة", logo: "/banks/alwahda.svg", primaryColor: "#0D47A1", secondaryColor: "#2196F3", cardGradient: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #2196F3 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "AlSahari", nameAr: "مصرف الصحاري", logo: "/banks/alsahari.svg", primaryColor: "#E65100", secondaryColor: "#FF9800", cardGradient: "linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FF9800 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "NorthAfrica", nameAr: "مصرف شمال أفريقيا", logo: "/banks/northafrica.svg", primaryColor: "#4A148C", secondaryColor: "#9C27B0", cardGradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #9C27B0 100%)", textColor: "#FFFFFF", hasOnePay: false },
  { name: "TradeDevelopment", nameAr: "التجارة والتنمية", logo: "/banks/trade.svg", primaryColor: "#006064", secondaryColor: "#00BCD4", cardGradient: "linear-gradient(135deg, #006064 0%, #00838F 50%, #00BCD4 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "AlAman", nameAr: "مصرف الأمان", logo: "/banks/alaman.svg", primaryColor: "#BF360C", secondaryColor: "#FF5722", cardGradient: "linear-gradient(135deg, #BF360C 0%, #E64A19 50%, #FF5722 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "AlSaray", nameAr: "مصرف السراي", logo: "/banks/alsaray.svg", primaryColor: "#1A237E", secondaryColor: "#3F51B5", cardGradient: "linear-gradient(135deg, #1A237E 0%, #283593 50%, #3F51B5 100%)", textColor: "#FFFFFF", hasOnePay: false },
  { name: "AlMutawasit", nameAr: "مصرف المتوسط", logo: "/banks/mediterranean.svg", primaryColor: "#004D40", secondaryColor: "#009688", cardGradient: "linear-gradient(135deg, #004D40 0%, #00695C 50%, #009688 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "AlAndalus", nameAr: "مصرف الأندلس", logo: "/banks/alandalus.svg", primaryColor: "#880E4F", secondaryColor: "#E91E63", cardGradient: "linear-gradient(135deg, #880E4F 0%, #AD1457 50%, #E91E63 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "AlYaqeen", nameAr: "مصرف اليقين", logo: "/banks/alyaqeen.svg", primaryColor: "#263238", secondaryColor: "#607D8B", cardGradient: "linear-gradient(135deg, #263238 0%, #37474F 50%, #607D8B 100%)", textColor: "#FFFFFF", hasOnePay: false },
  { name: "AlNuran", nameAr: "مصرف النوران", logo: "/banks/alnuran.svg", primaryColor: "#01579B", secondaryColor: "#03A9F4", cardGradient: "linear-gradient(135deg, #01579B 0%, #0288D1 50%, #03A9F4 100%)", textColor: "#FFFFFF", hasOnePay: true },
  { name: "NationalCommercial", nameAr: "مصرف التجاري", logo: "/banks/nationalcommercial.svg", primaryColor: "#1565C0", secondaryColor: "#42A5F5", cardGradient: "linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)", textColor: "#FFFFFF", hasOnePay: true },
];

const defaultSettings = [
  { key: 'payment_account_name', value: 'حساب التطبيق', description: 'اسم صاحب الحساب للتحويل' },
  { key: 'payment_account_number', value: '1234567890', description: 'رقم الحساب للتحويل' },
  { key: 'payment_bank', value: 'مصرف الجمهورية', description: 'اسم المصرف للتحويل' },
  { key: 'card_price', value: '15', description: 'سعر البطاقة بالدينار الليبي' },
  { key: 'card_validity_days', value: '7', description: 'عدد أيام صلاحية رابط البطاقة' },
];

export async function POST() {
  try {
    let banksAdded = 0;
    let banksUpdated = 0;
    
    for (const bank of libyanBanks) {
      try {
        const existing = await db.bank.findUnique({ where: { name: bank.name } });
        if (!existing) {
          await db.bank.create({ data: bank });
          banksAdded++;
        } else {
          // تحديث البيانات الموجودة
          await db.bank.update({
            where: { name: bank.name },
            data: {
              nameAr: bank.nameAr,
              primaryColor: bank.primaryColor,
              secondaryColor: bank.secondaryColor,
              cardGradient: bank.cardGradient,
              textColor: bank.textColor,
              hasOnePay: bank.hasOnePay,
            }
          });
          banksUpdated++;
        }
      } catch {
        // إذا الجدول غير موجود، حاول إنشاؤه
        await db.bank.create({ data: bank });
        banksAdded++;
      }
    }

    let settingsAdded = 0;
    let settingsUpdated = 0;
    
    for (const setting of defaultSettings) {
      try {
        const existing = await db.setting.findUnique({ where: { key: setting.key } });
        if (!existing) {
          await db.setting.create({ data: setting });
          settingsAdded++;
        } else {
          await db.setting.update({
            where: { key: setting.key },
            data: { value: setting.value, description: setting.description }
          });
          settingsUpdated++;
        }
      } catch {
        await db.setting.create({ data: setting });
        settingsAdded++;
      }
    }

    let adminCreated = false;
    try {
      const adminExists = await db.admin.findUnique({ where: { username: 'admin' } });
      if (!adminExists) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.admin.create({
          data: { username: 'admin', password: hashedPassword, name: 'المدير' },
        });
        adminCreated = true;
      }
    } catch {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.admin.create({
        data: { username: 'admin', password: hashedPassword, name: 'المدير' },
      });
      adminCreated = true;
    }

    const totalBanks = await db.bank.count();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح! 🎉',
      details: { banksAdded, banksUpdated, settingsAdded, settingsUpdated, adminCreated, totalBanks },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: `حدث خطأ: ${errorMessage}` }, { status: 500 });
  }
}

export async function GET() {
  try {
    const banksCount = await db.bank.count();
    const settingsCount = await db.setting.count();
    const adminCount = await db.admin.count();
    
    return NextResponse.json({
      success: true,
      status: { banks: banksCount, settings: settingsCount, admins: adminCount, needsSeed: banksCount === 0 },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    console.error('Status check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `فشل في الاتصال بقاعدة البيانات: ${errorMessage}`,
      hint: 'تأكد من أن الجداول تم إنشاؤها في قاعدة البيانات'
    }, { status: 500 });
  }
}
