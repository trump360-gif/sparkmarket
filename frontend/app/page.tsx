import { productsApi } from '@/lib/api/products';
import ProductList from '@/components/product/ProductList';

export default async function Home() {
  let initialProducts = [];
  let initialTotal = 0;
  let initialPage = 1;

  try {
    const response = await productsApi.getProducts({ page: 1, limit: 20 });
    initialProducts = response.data;
    initialTotal = response.total;
    initialPage = response.page;
  } catch (error) {
    console.error('Failed to fetch initial products:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 상품</h1>
          <p className="text-gray-600">총 {initialTotal}개의 상품</p>
        </div>

        <ProductList
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          initialPage={initialPage}
        />
      </div>
    </main>
  );
}
