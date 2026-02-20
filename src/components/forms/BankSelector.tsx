'use client';

import React from 'react';
import { Check, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface BankSelectorProps {
  banks: Bank[];
  selectedBank: Bank | null;
  onSelect: (bank: Bank) => void;
}

export function BankSelector({ banks, selectedBank, onSelect }: BankSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {banks.map((bank) => (
        <button
          key={bank.id}
          onClick={() => onSelect(bank)}
          className={cn(
            'relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg',
            'flex flex-col items-center gap-2 text-center',
            selectedBank?.id === bank.id
              ? 'border-primary shadow-lg ring-2 ring-primary/20'
              : 'border-gray-200 hover:border-gray-300'
          )}
          style={{
            background: selectedBank?.id === bank.id
              ? `linear-gradient(135deg, ${bank.primaryColor}15 0%, ${bank.secondaryColor}15 100%)`
              : 'white',
          }}
        >
          {/* علامة الاختيار */}
          {selectedBank?.id === bank.id && (
            <div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: bank.primaryColor }}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* أيقونة المصرف */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
            style={{
              background: bank.cardGradient || `linear-gradient(135deg, ${bank.primaryColor} 0%, ${bank.secondaryColor} 100%)`,
            }}
          >
            {bank.customIcon ? (
              <img 
                src={bank.customIcon} 
                alt={bank.nameAr} 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Building2 className="w-6 h-6 text-white" />
            )}
          </div>

          {/* اسم المصرف */}
          <span className="text-sm font-semibold text-gray-800">
            {bank.nameAr}
          </span>

          {/* شارة ONEPAY */}
          {bank.hasOnePay && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: bank.secondaryColor }}
            >
              ONEPAY
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
