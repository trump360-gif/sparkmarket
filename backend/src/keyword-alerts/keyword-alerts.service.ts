import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationsService,
  NotificationType,
  RelatedType,
} from '../notifications/notifications.service';
import { CreateKeywordAlertDto } from './dto/create-keyword-alert.dto';
import { UpdateKeywordAlertDto } from './dto/update-keyword-alert.dto';

@Injectable()
export class KeywordAlertsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateKeywordAlertDto) {
    // 가격 범위 유효성 검사
    if (dto.min_price && dto.max_price && dto.min_price > dto.max_price) {
      throw new BadRequestException(
        '최소 가격은 최대 가격보다 작아야 합니다.',
      );
    }

    // 이미 같은 키워드 알림이 있는지 확인
    const existingAlert = await this.prisma.keywordAlert.findUnique({
      where: {
        user_id_keyword: {
          user_id: userId,
          keyword: dto.keyword,
        },
      },
    });

    if (existingAlert) {
      throw new ConflictException('이미 등록된 키워드입니다.');
    }

    return this.prisma.keywordAlert.create({
      data: {
        user_id: userId,
        keyword: dto.keyword,
        category: dto.category,
        min_price: dto.min_price,
        max_price: dto.max_price,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.keywordAlert.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const alert = await this.prisma.keywordAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('키워드 알림을 찾을 수 없습니다.');
    }

    if (alert.user_id !== userId) {
      throw new NotFoundException('키워드 알림을 찾을 수 없습니다.');
    }

    return alert;
  }

  async update(userId: string, id: string, dto: UpdateKeywordAlertDto) {
    // 알림 존재 확인 및 권한 체크
    await this.findOne(userId, id);

    // 가격 범위 유효성 검사
    if (dto.min_price && dto.max_price && dto.min_price > dto.max_price) {
      throw new BadRequestException(
        '최소 가격은 최대 가격보다 작아야 합니다.',
      );
    }

    // 키워드를 변경하는 경우 중복 체크
    if (dto.keyword) {
      const existingAlert = await this.prisma.keywordAlert.findUnique({
        where: {
          user_id_keyword: {
            user_id: userId,
            keyword: dto.keyword,
          },
        },
      });

      if (existingAlert && existingAlert.id !== id) {
        throw new ConflictException('이미 등록된 키워드입니다.');
      }
    }

    return this.prisma.keywordAlert.update({
      where: { id },
      data: {
        keyword: dto.keyword,
        category: dto.category,
        min_price: dto.min_price,
        max_price: dto.max_price,
      },
    });
  }

  async remove(userId: string, id: string) {
    // 알림 존재 확인 및 권한 체크
    await this.findOne(userId, id);

    await this.prisma.keywordAlert.delete({
      where: { id },
    });

    return { message: '키워드 알림이 삭제되었습니다.' };
  }

  async toggle(userId: string, id: string) {
    // 알림 존재 확인 및 권한 체크
    const alert = await this.findOne(userId, id);

    const updated = await this.prisma.keywordAlert.update({
      where: { id },
      data: { is_active: !alert.is_active },
    });

    return updated;
  }

  /**
   * 새 상품이 등록될 때 매칭되는 키워드 알림을 확인하고 알림 생성
   * @param productId 상품 ID
   * @param productTitle 상품 제목
   * @param productCategory 상품 카테고리
   * @param productPrice 상품 가격
   */
  async checkAndNotify(
    productId: string,
    productTitle: string,
    productCategory: string,
    productPrice: number,
  ) {
    // 활성화된 모든 키워드 알림 조회
    const activeAlerts = await this.prisma.keywordAlert.findMany({
      where: { is_active: true },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    // 각 알림에 대해 매칭 여부 확인
    const matchedAlerts = activeAlerts.filter((alert) => {
      // 1. 키워드 매칭 (대소문자 구분 없이)
      const titleLower = productTitle.toLowerCase();
      const keywordLower = alert.keyword.toLowerCase();
      if (!titleLower.includes(keywordLower)) {
        return false;
      }

      // 2. 카테고리 필터 (설정된 경우)
      if (alert.category && alert.category !== productCategory) {
        return false;
      }

      // 3. 가격 범위 필터
      if (alert.min_price && productPrice < alert.min_price) {
        return false;
      }
      if (alert.max_price && productPrice > alert.max_price) {
        return false;
      }

      return true;
    });

    // 매칭된 사용자들에게 알림 전송
    const notifications = matchedAlerts.map((alert) => {
      return this.notificationsService.create({
        userId: alert.user_id,
        type: NotificationType.KEYWORD_ALERT,
        title: '키워드 알림',
        message: `관심 키워드 "${alert.keyword}"와 일치하는 상품이 등록되었습니다: ${productTitle} (${productPrice.toLocaleString()}원)`,
        relatedId: productId,
        relatedType: RelatedType.PRODUCT,
      });
    });

    await Promise.all(notifications);

    return {
      matchedCount: matchedAlerts.length,
      notificationsSent: notifications.length,
    };
  }
}
