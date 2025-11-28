'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification, NotificationType, RelatedType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Bell,
  Tag,
  Star,
  Package,
  ShoppingBag,
  CheckCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications({
        page,
        limit: 20,
        unreadOnly: filter === 'unread',
      });
      setNotifications(response.data);
      setTotalPages(response.totalPages);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/notifications');
      return;
    }
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading, router, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await notificationsApi.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (notification.related_id && notification.related_type) {
      switch (notification.related_type) {
        case RelatedType.PRODUCT:
          router.push(`/products/${notification.related_id}`);
          break;
        case RelatedType.TRANSACTION:
          router.push('/mypage?tab=transactions');
          break;
        case RelatedType.REVIEW:
          router.push('/mypage?tab=reviews');
          break;
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('읽은 알림을 모두 삭제하시겠습니까?')) return;

    try {
      await notificationsApi.deleteAllRead();
      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.PRICE_OFFER_RECEIVED:
      case NotificationType.PRICE_OFFER_ACCEPTED:
      case NotificationType.PRICE_OFFER_REJECTED:
        return <Tag className="w-6 h-6 text-primary-500" />;
      case NotificationType.REVIEW_RECEIVED:
        return <Star className="w-6 h-6 text-yellow-500" />;
      case NotificationType.PRODUCT_APPROVED:
      case NotificationType.PRODUCT_REJECTED:
        return <Package className="w-6 h-6 text-blue-500" />;
      case NotificationType.TRANSACTION_COMPLETED:
      case NotificationType.PRODUCT_SOLD:
        return <ShoppingBag className="w-6 h-6 text-green-500" />;
      default:
        return <Bell className="w-6 h-6 text-slate-500" />;
    }
  };

  const getNotificationBgColor = (type: NotificationType, isRead: boolean) => {
    if (isRead) return 'bg-white hover:bg-slate-50';

    switch (type) {
      case NotificationType.PRICE_OFFER_ACCEPTED:
      case NotificationType.PRODUCT_APPROVED:
        return 'bg-green-50 hover:bg-green-100';
      case NotificationType.PRICE_OFFER_REJECTED:
      case NotificationType.PRODUCT_REJECTED:
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-primary-50 hover:bg-primary-100';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-primary-500" />
                <h1 className="text-xl font-bold text-slate-900">알림</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-primary-600"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    모두 읽음
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAllRead}
                  className="text-slate-500"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  읽은 알림 삭제
                </Button>
              </div>
            </div>

            {/* 필터 탭 */}
            <div className="flex gap-2">
              <button
                onClick={() => { setFilter('all'); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => { setFilter('unread'); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-slate-500">알림을 불러오는 중...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  {filter === 'unread' ? '읽지 않은 알림이 없습니다' : '알림이 없습니다'}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 flex items-start gap-4 cursor-pointer transition-colors group ${getNotificationBgColor(notification.type, notification.is_read)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-base ${notification.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 text-sm text-slate-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
