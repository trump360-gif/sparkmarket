'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ProductCategory, type KeywordAlert } from '@/types';
import { Bell, BellOff, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KeywordAlertsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<KeywordAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<KeywordAlert | null>(null);

  // Form states
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAlerts();
  }, [user, router]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/keyword-alerts');
      // setAlerts(response.data);
      setAlerts([]);
    } catch (error) {
      console.error('Failed to fetch keyword alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const alertData = {
        keyword,
        category: category || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
      };

      if (editingAlert) {
        // TODO: Update alert
        // await apiClient.patch(`/keyword-alerts/${editingAlert.id}`, alertData);
      } else {
        // TODO: Create alert
        // await apiClient.post('/keyword-alerts', alertData);
      }

      resetForm();
      setShowModal(false);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
  };

  const handleToggle = async (alertId: string, isActive: boolean) => {
    try {
      // TODO: Toggle alert
      // await apiClient.patch(`/keyword-alerts/${alertId}`, { is_active: !isActive });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;

    try {
      // TODO: Delete alert
      // await apiClient.delete(`/keyword-alerts/${alertId}`);
      fetchAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const handleEdit = (alert: KeywordAlert) => {
    setEditingAlert(alert);
    setKeyword(alert.keyword);
    setCategory(alert.category as ProductCategory || '');
    setMinPrice(alert.min_price || '');
    setMaxPrice(alert.max_price || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAlert(null);
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">키워드 알림</h1>
          <p className="text-slate-600 text-sm mt-1">
            관심 키워드를 등록하면 새로운 상품이 등록될 때 알림을 받을 수 있습니다
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          알림 추가
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            등록된 키워드 알림이 없습니다
          </h3>
          <p className="text-slate-500 mb-6">
            관심있는 키워드를 등록하고 새로운 상품 알림을 받아보세요
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            첫 알림 등록하기
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-slate-900">
                      #{alert.keyword}
                    </span>
                    {alert.is_active ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        활성
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                        비활성
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    {alert.category && (
                      <span className="px-2 py-1 bg-slate-100 rounded">
                        카테고리: {alert.category}
                      </span>
                    )}
                    {(alert.min_price || alert.max_price) && (
                      <span className="px-2 py-1 bg-slate-100 rounded">
                        가격: {alert.min_price?.toLocaleString() || '0'}원 ~{' '}
                        {alert.max_price?.toLocaleString() || '무제한'}원
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(alert.id, alert.is_active)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title={alert.is_active ? '알림 비활성화' : '알림 활성화'}
                  >
                    {alert.is_active ? (
                      <Bell className="w-5 h-5 text-green-600" />
                    ) : (
                      <BellOff className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(alert)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingAlert ? '알림 수정' : '새 알림 등록'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  키워드 *
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="예: 아이폰, 노트북"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  카테고리 (선택사항)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">전체 카테고리</option>
                  {Object.values(ProductCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    최소 가격
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    최대 가격
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="무제한"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAlert ? '수정' : '등록'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
