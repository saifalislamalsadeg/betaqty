'use client';

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Building2, Phone, User, Hash, ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight } from 'lucide-react';

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

interface BankCardProps {
  bank: Bank;
  accountName: string;
  accountNumber: string;
  phoneNumber: string;
  showQR?: boolean;
  isPreview?: boolean;
  isPaid?: boolean; // هل البطاقة مدفوعة ومفعلة
  watermarkText?: string;
  watermarkEnabled?: boolean;
  showOnePayBadge?: boolean;
}

export const BankCard = forwardRef<HTMLDivElement, BankCardProps>(
  ({ bank, accountName, accountNumber, phoneNumber, showQR = true, isPreview = false, isPaid = true, watermarkText = 'غير مدفوع', watermarkEnabled = true, showOnePayBadge = true }, ref) => {
    // تنسيق رقم الحساب (4 خانات ثم مسافة)
    const formatAccountNumber = (num: string) => {
      const cleaned = num.replace(/\s/g, '');
      const groups = cleaned.match(/.{1,4}/g) || [];
      return groups.join(' ');
    };

    const formattedAccountNumber = formatAccountNumber(accountNumber);

    const qrData = JSON.stringify({
      bank: bank.nameAr,
      name: accountName,
      account: accountNumber,
    });

    const cardStyle = {
      background: bank.cardGradient || `linear-gradient(135deg, ${bank.primaryColor} 0%, ${bank.secondaryColor} 100%)`,
    };

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-3xl shadow-2xl ${
          isPreview ? 'w-full max-w-md' : 'w-[400px] h-[250px]'
        }`}
        style={cardStyle}
      >
        {/* الخلفية المزخرفة */}
        <div className="absolute inset-0 overflow-hidden">
          {/* دوائر زخرفية */}
          <div
            className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-10"
            style={{ backgroundColor: bank.textColor }}
          />
          <div
            className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: bank.textColor }}
          />
          <div
            className="absolute right-1/3 top-1/2 w-64 h-64 rounded-full opacity-5"
            style={{ backgroundColor: bank.textColor }}
          />
          
          {/* خطوط زخرفية */}
          <div
            className="absolute top-0 right-0 w-full h-1 opacity-30"
            style={{ background: `linear-gradient(90deg, transparent, ${bank.textColor})` }}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-1 opacity-30"
            style={{ background: `linear-gradient(90deg, ${bank.textColor}, transparent)` }}
          />
        </div>

        {/* العلامة المائية - تظهر فقط إذا لم تكن البطاقة مدفوعة */}
        {!isPaid && watermarkEnabled && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* خلفية شفافة خفيفة جداً */}
            <div className="absolute inset-0 bg-black/10" />
            
            {/* الأسهم من الزوايا الأربع */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* السهم العلوي الأيمن */}
              <div className="absolute top-4 right-4">
                <ArrowUpRight className="w-8 h-8 text-red-500/35 animate-pulse" />
              </div>
              
              {/* السهم العلوي الأيسر */}
              <div className="absolute top-4 left-4">
                <ArrowUpLeft className="w-8 h-8 text-red-500/35 animate-pulse" />
              </div>
              
              {/* السهم السفلي الأيمن */}
              <div className="absolute bottom-4 right-4">
                <ArrowDownRight className="w-8 h-8 text-red-500/35 animate-pulse" />
              </div>
              
              {/* السهم السفلي الأيسر */}
              <div className="absolute bottom-4 left-4">
                <ArrowDownLeft className="w-8 h-8 text-red-500/35 animate-pulse" />
              </div>
              
              {/* خطوط متقاطعة من الزوايا */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
                {/* خط من الزاوية العلوية اليمنى */}
                <line x1="400" y1="0" x2="200" y2="125" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1.5" strokeDasharray="6,3" />
                {/* خط من الزاوية العلوية اليسرى */}
                <line x1="0" y1="0" x2="200" y2="125" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1.5" strokeDasharray="6,3" />
                {/* خط من الزاوية السفلية اليمنى */}
                <line x1="400" y1="250" x2="200" y2="125" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1.5" strokeDasharray="6,3" />
                {/* خط من الزاوية السفلية اليسرى */}
                <line x1="0" y1="250" x2="200" y2="125" stroke="rgba(239, 68, 68, 0.1)" strokeWidth="1.5" strokeDasharray="6,3" />
              </svg>
              
              {/* النص في المنتصف */}
              <div className="relative flex flex-col items-center justify-center bg-red-600/45 backdrop-blur-[2px] px-5 py-2.5 rounded-2xl shadow-lg transform rotate-[-8deg] border border-red-400/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-lg font-bold text-white tracking-wide">{watermarkText}</span>
                </div>
                <span className="text-xs text-white/75 mt-0.5">يجب إتمام الدفع لتحميل البطاقة</span>
              </div>
            </div>
            
            {/* دوائر متحركة خفيفة جداً */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border border-red-500/10 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
          </div>
        )}

        {/* المحتوى */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between" dir="rtl">
          {/* الجزء العلوي - اسم المصرف */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {bank.customIcon ? (
                  <img 
                    src={bank.customIcon} 
                    alt={bank.nameAr} 
                    className="w-9 h-9 object-contain"
                  />
                ) : (
                  <Building2 className="w-7 h-7" style={{ color: bank.textColor }} />
                )}
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: bank.textColor }}
                >
                  {bank.nameAr}
                </h2>
                <p
                  className="text-xs opacity-80"
                  style={{ color: bank.textColor }}
                >
                  بطاقة معلومات الحساب
                </p>
              </div>
            </div>
            
            {/* ONEPAY Badge */}
            {bank.hasOnePay && showOnePayBadge && (
              <div
                className="px-3 py-1.5 rounded-lg backdrop-blur-sm text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: bank.textColor,
                }}
              >
                ONEPAY ✓
              </div>
            )}
          </div>

          {/* الجزء الأوسط - معلومات الحساب */}
          <div className="flex gap-4 items-end justify-between">
            <div className="flex-1 space-y-3">
              {/* اسم صاحب الحساب */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 opacity-70" style={{ color: bank.textColor }} />
                <div>
                  <p
                    className="text-xs opacity-70"
                    style={{ color: bank.textColor }}
                  >
                    اسم صاحب الحساب
                  </p>
                  <p
                    className="text-lg font-bold"
                    style={{ color: bank.textColor }}
                  >
                    {accountName || 'الاسم هنا'}
                  </p>
                </div>
              </div>

              {/* رقم الحساب */}
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 opacity-70" style={{ color: bank.textColor }} />
                <div>
                  <p
                    className="text-xs opacity-70"
                    style={{ color: bank.textColor }}
                  >
                    رقم الحساب
                  </p>
                  <p
                    className="text-lg font-bold tracking-wider font-mono"
                    style={{ color: bank.textColor }}
                    dir="ltr"
                  >
                    {formattedAccountNumber || '0000 0000 0000 0000'}
                  </p>
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 opacity-70" style={{ color: bank.textColor }} />
                <div>
                  <p
                    className="text-xs opacity-70"
                    style={{ color: bank.textColor }}
                  >
                    للتواصل
                  </p>
                  <p
                    className="text-base font-semibold"
                    style={{ color: bank.textColor }}
                  >
                    {phoneNumber || '09XXXXXXXX'}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {showQR && accountNumber && (
              <div
                className="p-2 rounded-xl backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
              >
                <QRCodeSVG
                  value={qrData}
                  size={70}
                  level="M"
                  bgColor="transparent"
                  fgColor={bank.primaryColor}
                />
              </div>
            )}
          </div>
        </div>

        {/* شريط سفلي */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: bank.secondaryColor }}
        />
      </div>
    );
  }
);

BankCard.displayName = 'BankCard';
