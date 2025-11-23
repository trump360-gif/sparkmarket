import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSoldProducts() {
  console.log('Starting migration of sold products to transactions...');

  // 현재 활성화된 수수료율 조회 (없으면 기본값 5% 사용)
  let commissionSettings = await prisma.commissionSettings.findFirst({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
  });

  if (!commissionSettings) {
    console.log('No commission settings found, creating default (5%)...');
    commissionSettings = await prisma.commissionSettings.create({
      data: {
        commission_rate: 5.0,
        is_active: true,
      },
    });
  }

  const commissionRate = commissionSettings.commission_rate;
  console.log(`Using commission rate: ${commissionRate}%`);

  // 판매 완료된 상품 중 거래 내역이 없는 것들 조회
  const soldProducts = await prisma.product.findMany({
    where: {
      status: 'SOLD',
    },
    select: {
      id: true,
      seller_id: true,
      price: true,
      created_at: true,
      updated_at: true,
    },
  });

  console.log(`Found ${soldProducts.length} sold products`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const product of soldProducts) {
    // 이미 거래 내역이 있는지 확인
    const existingTransaction = await prisma.transaction.findFirst({
      where: { product_id: product.id },
    });

    if (existingTransaction) {
      console.log(`Skipping product ${product.id} - transaction already exists`);
      skippedCount++;
      continue;
    }

    // 수수료 계산
    const commissionAmount = Math.floor((product.price * commissionRate) / 100);
    const sellerAmount = product.price - commissionAmount;

    // 거래 내역 생성
    // 주의: buyer_id는 알 수 없으므로 임시로 'unknown'을 사용
    // 실제로는 구매자 정보가 없어서 'unknown' 또는 시스템 사용자 ID를 사용
    await prisma.transaction.create({
      data: {
        product_id: product.id,
        seller_id: product.seller_id,
        buyer_id: 'unknown', // 구매자 정보를 알 수 없음
        product_price: product.price,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        seller_amount: sellerAmount,
        status: 'COMPLETED',
        created_at: product.updated_at, // 상품이 업데이트된 시간을 거래 시간으로 사용
      },
    });

    console.log(`Created transaction for product ${product.id}`);
    createdCount++;
  }

  console.log('\nMigration completed!');
  console.log(`Created: ${createdCount} transactions`);
  console.log(`Skipped: ${skippedCount} transactions (already exist)`);
}

migrateSoldProducts()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
