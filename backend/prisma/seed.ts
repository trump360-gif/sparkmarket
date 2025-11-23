import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 관리자 계정 생성
  const adminPassword = await bcrypt.hash('admin123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sparkmarket.com' },
    update: {},
    create: {
      email: 'admin@sparkmarket.com',
      password_hash: adminPassword,
      nickname: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ 관리자 계정 생성 완료:', {
    id: admin.id,
    email: admin.email,
    nickname: admin.nickname,
    role: admin.role,
  });

  // 테스트 일반 유저 생성
  const userPassword = await bcrypt.hash('user123456', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@sparkmarket.com' },
    update: {},
    create: {
      email: 'test@sparkmarket.com',
      password_hash: userPassword,
      nickname: 'TestUser',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ 테스트 유저 생성 완료:', {
    id: testUser.id,
    email: testUser.email,
    nickname: testUser.nickname,
    role: testUser.role,
  });

  console.log('🎉 Seed 완료!');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
