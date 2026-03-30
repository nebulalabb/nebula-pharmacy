import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Default Admin User
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nebula.vn' },
    update: {},
    create: {
      email: 'admin@nebula.vn',
      name: 'Chủ Nhà Thuốc',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Seed: Created Admin user');

  // 2. Create Sample Categories
  const categories = [
    { name: 'Thuốc giảm đau, hạ sốt' },
    { name: 'Kháng sinh' },
    { name: 'Hô hấp' },
    { name: 'Thực phẩm chức năng' },
    { name: 'Vật tư y tế' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('Seed: Created sample categories');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
