import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // جلب إعدادات الموقع
    let siteSettings = await db.siteSettings.findFirst();
    if (!siteSettings) {
      siteSettings = await db.siteSettings.create({ data: {} });
    }
    
    // إرجاع الإعدادات بالتنسيق المتوافق مع الواجهة الأمامية
    // الواجهة تستخدم settings للدفع و siteSettings للعرض
    return NextResponse.json({ 
      success: true, 
      // إعدادات الدفع (للتوافق مع الكود القديم)
      settings: {
        payment_account_name: siteSettings.paymentAccountName,
        payment_account_number: siteSettings.paymentAccountNumber,
        payment_bank: siteSettings.paymentBank,
        card_price: siteSettings.cardPrice,
        card_validity_days: siteSettings.cardValidityDays,
      },
      // إعدادات العرض
      siteSettings: {
        siteName: siteSettings.siteName,
        siteDescription: siteSettings.siteDescription,
        primaryColor: siteSettings.primaryColor,
        secondaryColor: siteSettings.secondaryColor,
        welcomeTitle: siteSettings.welcomeTitle,
        welcomeSubtitle: siteSettings.welcomeSubtitle,
        paymentTitle: siteSettings.paymentTitle,
        completedTitle: siteSettings.completedTitle,
        footerText: siteSettings.footerText,
        showFooterYear: siteSettings.showFooterYear,
        showOnePayBadge: siteSettings.showOnePayBadge,
        watermarkText: siteSettings.watermarkText,
        watermarkEnabled: siteSettings.watermarkEnabled,
        // إضافة إعدادات الدفع للـ siteSettings أيضًا
        paymentAccountName: siteSettings.paymentAccountName,
        paymentAccountNumber: siteSettings.paymentAccountNumber,
        paymentBank: siteSettings.paymentBank,
        cardPrice: siteSettings.cardPrice,
        cardValidityDays: siteSettings.cardValidityDays,
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإعدادات' },
      { status: 500 }
    );
  }
}
