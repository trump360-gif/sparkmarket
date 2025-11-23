import { productsApi } from '@/lib/api/products';
import ProductDetail from '@/components/product/ProductDetail';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product = null;

  try {
    product = await productsApi.getProduct(params.id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductDetail product={product} />
      </div>
    </div>
  );
}
