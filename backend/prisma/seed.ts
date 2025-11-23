import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');

  const hashedPassword = await bcrypt.hash('user123456', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123456', 10);

  const testUser = await prisma.user.create({
    data: {
      email: 'test@sparkmarket.com',
      password_hash: hashedPassword,
      nickname: '테스트유저',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@sparkmarket.com',
      password_hash: hashedAdminPassword,
      nickname: '관리자',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@sparkmarket.com',
      password_hash: hashedPassword,
      nickname: '판매왕',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'user3@sparkmarket.com',
      password_hash: hashedPassword,
      nickname: '중고나라',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created ${4} users`);

  // Create products
  console.log('📦 Creating products...');

  const products = [
    // Electronics
    {
      title: '아이폰 14 Pro 256GB 스페이스 블랙',
      description: '작년에 구매한 아이폰 14 Pro입니다. 상태 매우 좋고 스크래치 없습니다. 정품 케이스와 충전기 포함해서 드립니다.',
      price: 950000,
      category: 'ELECTRONICS',
      status: 'FOR_SALE',
      seller_id: testUser.id,
    },
    {
      title: '맥북 에어 M2 2023년형',
      description: 'M2 맥북 에어 13인치, 8GB RAM, 256GB SSD입니다. 거의 새것이고 박스와 모든 구성품 포함입니다.',
      price: 1200000,
      category: 'ELECTRONICS',
      status: 'FOR_SALE',
      seller_id: user2.id,
    },
    {
      title: '에어팟 프로 2세대',
      description: '1달 사용한 에어팟 프로 2세대입니다. USB-C 버전이고 노이즈캔슬링 완벽하게 작동합니다.',
      price: 250000,
      category: 'ELECTRONICS',
      status: 'FOR_SALE',
      seller_id: user3.id,
    },
    {
      title: '삼성 갤럭시 탭 S9',
      description: '갤럭시 탭 S9 와이파이 모델입니다. S펜 포함, 상태 A급입니다.',
      price: 550000,
      category: 'ELECTRONICS',
      status: 'SOLD',
      seller_id: testUser.id,
    },
    {
      title: '소니 WH-1000XM5 헤드폰',
      description: '소니 최신형 노이즈캔슬링 헤드폰입니다. 거의 새것이고 케이스 포함입니다.',
      price: 350000,
      category: 'ELECTRONICS',
      status: 'FOR_SALE',
      seller_id: user2.id,
    },

    // Fashion
    {
      title: '나이키 에어포스 1 화이트 (270mm)',
      description: '클래식 에어포스 1 화이트입니다. 3번 정도만 신었고 상태 최상입니다.',
      price: 85000,
      category: 'FASHION',
      status: 'FOR_SALE',
      seller_id: user3.id,
    },
    {
      title: '노스페이스 구스다운 패딩 (100)',
      description: '노스페이스 정품 구스다운 패딩입니다. 사이즈 100, 올해 겨울 시즌 모델입니다.',
      price: 380000,
      category: 'FASHION',
      status: 'FOR_SALE',
      seller_id: testUser.id,
    },
    {
      title: '디스커버리 백팩',
      description: '디스커버리 정품 백팩입니다. 거의 사용 안 했고 깨끗합니다.',
      price: 45000,
      category: 'FASHION',
      status: 'FOR_SALE',
      seller_id: user2.id,
    },

    // Home
    {
      title: 'LG 스탠바이미 27인치',
      description: 'LG 스탠바이미 무선 이동식 TV입니다. 사용감 거의 없고 정상작동합니다.',
      price: 850000,
      category: 'HOME',
      status: 'FOR_SALE',
      seller_id: user3.id,
    },
    {
      title: '다이슨 무선청소기 V15',
      description: '다이슨 V15 디텍트 무선청소기입니다. 구매한지 6개월 되었고 상태 좋습니다.',
      price: 550000,
      category: 'HOME',
      status: 'FOR_SALE',
      seller_id: testUser.id,
    },
    {
      title: '에이스 침대 퀸 매트리스',
      description: '에이스 침대 퀸 사이즈 매트리스입니다. 2년 사용했고 이사로 인해 판매합니다.',
      price: 400000,
      category: 'HOME',
      status: 'SOLD',
      seller_id: user2.id,
    },
    {
      title: '한샘 책상 세트',
      description: '한샘 컴퓨터 책상과 의자 세트입니다. 상태 양호하고 직접 방문 픽업만 가능합니다.',
      price: 150000,
      category: 'HOME',
      status: 'FOR_SALE',
      seller_id: user3.id,
    },

    // Books
    {
      title: '클린코드 (Clean Code) - 로버트 마틴',
      description: '프로그래밍 필독서 클린코드입니다. 밑줄 없고 깨끗합니다.',
      price: 25000,
      category: 'BOOKS',
      status: 'FOR_SALE',
      seller_id: testUser.id,
    },
    {
      title: '해리포터 시리즈 전권 (1-7권)',
      description: '해리포터 한국어판 전권 세트입니다. 보관 상태 좋습니다.',
      price: 60000,
      category: 'BOOKS',
      status: 'FOR_SALE',
      seller_id: user2.id,
    },
    {
      title: '토익 기출 문제집 10권',
      description: '최신 토익 기출 문제집입니다. 거의 사용 안 했고 답지 포함입니다.',
      price: 15000,
      category: 'BOOKS',
      status: 'FOR_SALE',
      seller_id: user3.id,
    },

    // Sports
    {
      title: '던롭 테니스 라켓',
      description: '던롭 정품 테니스 라켓입니다. 그립 새것으로 교체했습니다.',
      price: 120000,
      category: 'SPORTS',
      status: 'FOR_SALE',
      seller_id: testUser.id,
    },
    {
      title: '요가매트 + 요가볼 세트',
      description: '린바이크 요가매트와 짐볼 세트입니다. 거의 새것입니다.',
      price: 35000,
      category: 'SPORTS',
      status: 'FOR_SALE',
      seller_id: user2.id,
    },
    {
      title: '캠핑 텐트 (4인용)',
      description: '코베아 4인용 텐트입니다. 3회 사용했고 상태 좋습니다.',
      price: 180000,
      category: 'SPORTS',
      status: 'SOLD',
      seller_id: user3.id,
    },

    // Others
    {
      title: '플레이스테이션 5 디지털 에디션',
      description: 'PS5 디지털 에디션입니다. 컨트롤러 2개 포함이고 상태 최상입니다.',
      price: 450000,
      category: 'OTHER',
      status: 'FOR_SALE',
      seller_id: testUser.id,
    },
    {
      title: '닌텐도 스위치 OLED',
      description: '닌텐도 스위치 OLED 화이트 모델입니다. 젤다 게임 포함해서 드립니다.',
      price: 320000,
      category: 'OTHER',
      status: 'FOR_SALE',
      seller_id: user2.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    });
  }

  console.log(`✅ Created ${products.length} products`);

  // Get final counts
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const forSaleCount = await prisma.product.count({
    where: { status: 'FOR_SALE' },
  });
  const soldCount = await prisma.product.count({
    where: { status: 'SOLD' },
  });

  console.log('\n📊 Database seeding completed!');
  console.log('==========================================');
  console.log(`👥 Total users: ${userCount}`);
  console.log(`📦 Total products: ${productCount}`);
  console.log(`🟢 Products for sale: ${forSaleCount}`);
  console.log(`🔴 Sold products: ${soldCount}`);
  console.log('==========================================');
  console.log('\n🔐 Test accounts:');
  console.log('   📧 test@sparkmarket.com / user123456 (일반 유저)');
  console.log('   📧 admin@sparkmarket.com / admin123456 (관리자)');
  console.log('   📧 user2@sparkmarket.com / user123456');
  console.log('   📧 user3@sparkmarket.com / user123456');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
