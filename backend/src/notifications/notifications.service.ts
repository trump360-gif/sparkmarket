import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum NotificationType {
  // 가격 제안 관련
  PRICE_OFFER_RECEIVED = 'PRICE_OFFER_RECEIVED',
  PRICE_OFFER_ACCEPTED = 'PRICE_OFFER_ACCEPTED',
  PRICE_OFFER_REJECTED = 'PRICE_OFFER_REJECTED',
  // 리뷰 관련
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  // 상품 관련
  PRODUCT_SOLD = 'PRODUCT_SOLD',
  PRODUCT_APPROVED = 'PRODUCT_APPROVED',
  PRODUCT_REJECTED = 'PRODUCT_REJECTED',
  // 거래 관련
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
  // 키워드 알림
  KEYWORD_ALERT = 'KEYWORD_ALERT',
  // 가격 인하 알림
  PRICE_DROP = 'PRICE_DROP',
  // 팔로우 관련
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  FOLLOWED_USER_PRODUCT = 'FOLLOWED_USER_PRODUCT',
}

export enum RelatedType {
  PRODUCT = 'PRODUCT',
  PRICE_OFFER = 'PRICE_OFFER',
  REVIEW = 'REVIEW',
  TRANSACTION = 'TRANSACTION',
  USER = 'USER',
}

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: RelatedType;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        related_id: data.relatedId,
        related_type: data.relatedType,
      },
    });
  }

  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(unreadOnly && { is_read: false }),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { user_id: userId, is_read: false },
      }),
    ]);

    return {
      data: notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { user_id: userId, is_read: false },
    });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        user_id: userId,
      },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: { is_read: true },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });
  }

  async deleteAllRead(userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        user_id: userId,
        is_read: true,
      },
    });
  }

  // 가격 제안 관련 알림 헬퍼 메서드
  async notifyPriceOfferReceived(
    sellerId: string,
    buyerNickname: string,
    productTitle: string,
    offeredPrice: number,
    offerId: string,
    productId: string,
  ) {
    return this.create({
      userId: sellerId,
      type: NotificationType.PRICE_OFFER_RECEIVED,
      title: '새로운 가격 제안',
      message: `${buyerNickname}님이 "${productTitle}"에 ${offeredPrice.toLocaleString()}원을 제안했습니다.`,
      relatedId: productId,
      relatedType: RelatedType.PRODUCT,
    });
  }

  async notifyPriceOfferAccepted(
    buyerId: string,
    productTitle: string,
    offeredPrice: number,
    productId: string,
  ) {
    return this.create({
      userId: buyerId,
      type: NotificationType.PRICE_OFFER_ACCEPTED,
      title: '가격 제안 수락됨',
      message: `"${productTitle}"에 대한 ${offeredPrice.toLocaleString()}원 제안이 수락되었습니다!`,
      relatedId: productId,
      relatedType: RelatedType.PRODUCT,
    });
  }

  async notifyPriceOfferRejected(
    buyerId: string,
    productTitle: string,
    productId: string,
  ) {
    return this.create({
      userId: buyerId,
      type: NotificationType.PRICE_OFFER_REJECTED,
      title: '가격 제안 거절됨',
      message: `"${productTitle}"에 대한 가격 제안이 거절되었습니다.`,
      relatedId: productId,
      relatedType: RelatedType.PRODUCT,
    });
  }

  // 리뷰 관련 알림
  async notifyReviewReceived(
    revieweeId: string,
    reviewerNickname: string,
    rating: number,
  ) {
    return this.create({
      userId: revieweeId,
      type: NotificationType.REVIEW_RECEIVED,
      title: '새로운 리뷰',
      message: `${reviewerNickname}님이 ${rating}점 리뷰를 남겼습니다.`,
      relatedType: RelatedType.REVIEW,
    });
  }

  // 상품 관련 알림
  async notifyProductApproved(sellerId: string, productTitle: string, productId: string) {
    return this.create({
      userId: sellerId,
      type: NotificationType.PRODUCT_APPROVED,
      title: '상품 승인됨',
      message: `"${productTitle}" 상품이 승인되어 판매가 시작되었습니다.`,
      relatedId: productId,
      relatedType: RelatedType.PRODUCT,
    });
  }

  async notifyProductRejected(
    sellerId: string,
    productTitle: string,
    reason: string,
    productId: string,
  ) {
    return this.create({
      userId: sellerId,
      type: NotificationType.PRODUCT_REJECTED,
      title: '상품 반려됨',
      message: `"${productTitle}" 상품이 반려되었습니다. 사유: ${reason}`,
      relatedId: productId,
      relatedType: RelatedType.PRODUCT,
    });
  }

  // 거래 완료 알림
  async notifyTransactionCompleted(
    userId: string,
    productTitle: string,
    role: 'buyer' | 'seller',
    transactionId: string,
  ) {
    const roleText = role === 'buyer' ? '구매' : '판매';
    return this.create({
      userId,
      type: NotificationType.TRANSACTION_COMPLETED,
      title: `${roleText} 완료`,
      message: `"${productTitle}" ${roleText}가 완료되었습니다. 거래 상대방에게 리뷰를 남겨주세요!`,
      relatedId: transactionId,
      relatedType: RelatedType.TRANSACTION,
    });
  }
}
