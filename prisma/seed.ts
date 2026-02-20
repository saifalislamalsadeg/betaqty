import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const libyanBanks = [
  {
    name: "AlJumhuriya",
    nameAr: "مصرف الجمهورية",
    logo: "/banks/aljumhuriya.svg",
    primaryColor: "#1B5E20",
    secondaryColor: "#4CAF50",
    cardGradient: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "AlWahda",
    nameAr: "مصرف الوحدة",
    logo: "/banks/alwahda.svg",
    primaryColor: "#0D47A1",
    secondaryColor: "#2196F3",
    cardGradient: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #2196F3 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "AlSahari",
    nameAr: "مصرف الصحاري",
    logo: "/banks/alsahari.svg",
    primaryColor: "#E65100",
    secondaryColor: "#FF9800",
    cardGradient: "linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FF9800 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "NorthAfrica",
    nameAr: "مصرف شمال أفريقيا",
    logo: "/banks/northafrica.svg",
    primaryColor: "#4A148C",
    secondaryColor: "#9C27B0",
    cardGradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #9C27B0 100%)",
    textColor: "#FFFFFF",
    hasOnePay: false,
  },
  {
    name: "TradeDevelopment",
    nameAr: "التجارة والتنمية",
    logo: "/banks/trade.svg",
    primaryColor: "#006064",
    secondaryColor: "#00BCD4",
    cardGradient: "linear-gradient(135deg, #006064 0%, #00838F 50%, #00BCD4 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "AlAman",
    nameAr: "مصرف الأمان",
    logo: "/banks/alaman.svg",
    primaryColor: "#BF360C",
    secondaryColor: "#FF5722",
    cardGradient: "linear-gradient(135deg, #BF360C 0%, #E64A19 50%, #FF5722 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "AlSaray",
    nameAr: "مصرف السراي",
    logo: "/banks/alsaray.svg",
    primaryColor: "#1A237E",
    secondaryColor: "#3F51B5",
    cardGradient: "linear-gradient(135deg, #1A237E 0%, #283593 50%, #3F51B5 100%)",
    textColor: "#FFFFFF",
    hasOnePay: false,
  },
  {
    name: "AlMutawasit",
    nameAr: "مصرف المتوسط",
    logo: "/banks/mediterranean.svg",
    primaryColor: "#004D40",
    secondaryColor: "#009688",
    cardGradient: "linear-gradient(135deg, #004D40 0%, #00695C 50%, #009688 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "AlAndalus",
    nameAr: "مصرف الأندلس",
    logo: "/banks/alandalus.svg",
    primaryColor: "#880E4F",
    secondaryColor: "#E91E63",
    cardGradient: "linear-gradient(135deg, #880E4F 0%, #AD1457 50%, #E91E63 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "AlYaqeen",
    nameAr: "مصرف اليقين",
    logo: "/banks/alyaqeen.svg",
    primaryColor: "#263238",
    secondaryColor: "#607D8B",
    cardGradient: "linear-gradient(135deg, #263238 0%, #37474F 50%, #607D8B 100%)",
    textColor: "#FFFFFF",
    hasOnePay: false,
  },
  {
    name: "AlNuran",
    nameAr: "مصرف النوران",
    logo: "/banks/alnuran.svg",
    primaryColor: "#01579B",
    secondaryColor: "#03A9F4",
    cardGradient: "linear-gradient(135deg, #01579B 0%, #0288D1 50%, #03A9F4 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
  {
    name: "NationalCommercial",
    nameAr: "مصرف التجاري",
    logo: "/banks/nationalcommercial.svg",
    primaryColor: "#1565C0",
    secondaryColor: "#42A5F5",
    cardGradient: "linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)",
    textColor: "#FFFFFF",
    hasOnePay: true,
  },
];

async function main() {
  console.log("🌱 Seeding Libyan banks...");
  
  for (const bank of libyanBanks) {
    await prisma.bank.upsert({
      where: { name: bank.name },
      update: bank,
      create: bank,
    });
    console.log(`✅ Added/Updated: ${bank.nameAr}`);
  }
  
  // إضافة إعدادات النظام
  await prisma.setting.upsert({
    where: { key: 'payment_account_name' },
    update: { value: 'حساب التطبيق', description: 'اسم صاحب الحساب للتحويل' },
    create: { key: 'payment_account_name', value: 'حساب التطبيق', description: 'اسم صاحب الحساب للتحويل' },
  });
  
  await prisma.setting.upsert({
    where: { key: 'payment_account_number' },
    update: { value: '1234567890', description: 'رقم الحساب للتحويل' },
    create: { key: 'payment_account_number', value: '1234567890', description: 'رقم الحساب للتحويل' },
  });
  
  await prisma.setting.upsert({
    where: { key: 'payment_bank' },
    update: { value: 'مصرف الجمهورية', description: 'اسم المصرف للتحويل' },
    create: { key: 'payment_bank', value: 'مصرف الجمهورية', description: 'اسم المصرف للتحويل' },
  });
  
  await prisma.setting.upsert({
    where: { key: 'card_price' },
    update: { value: '15', description: 'سعر البطاقة بالدينار الليبي' },
    create: { key: 'card_price', value: '15', description: 'سعر البطاقة بالدينار الليبي' },
  });
  
  await prisma.setting.upsert({
    where: { key: 'card_validity_days' },
    update: { value: '7', description: 'عدد أيام صلاحية رابط البطاقة' },
    create: { key: 'card_validity_days', value: '7', description: 'عدد أيام صلاحية رابط البطاقة' },
  });
  
  console.log("✅ Settings added");
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
