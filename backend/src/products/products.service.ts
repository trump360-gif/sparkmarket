import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CommissionService } from '../commission/commission.service';
import { ModerationService } from '../moderation/moderation.service';
import { RecentViewsService } from '../recent-views/recent-views.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { KeywordAlertsService } from '../keyword-alerts/keyword-alerts.service';
import { FollowsService } from '../follows/follows.service';
import { NotificationsService, NotificationType, RelatedType } from '../notifications/notifications.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private commissionService: CommissionService,
    private moderationService: ModerationService,
    private recentViewsService: RecentViewsService,
    private hashtagsService: HashtagsService,
    private keywordAlertsService: KeywordAlertsService,
    private followsService: FollowsService,
    private notificationsService: NotificationsService,
  ) { }

  async create(userId: string, createProductDto: CreateProductDto) {
    const {
      title,
      description,
      price,
      category,
      images,
      condition,
      trade_method,
      trade_location,
      brand_id,
      hashtags,
    } = createProductDto;

    // 콘텐츠 검토
    const moderationResult = this.moderationService.checkContent(
      title,
      description,
      price,
      category,
    );

    // 검토가 필요한 경우 PENDING_REVIEW 상태로, 아니면 FOR_SALE로
    const status = moderationResult.needsReview ? 'PENDING_REVIEW' : 'FOR_SALE';
    const reviewReason = moderationResult.needsReview
      ? moderationResult.reasons.join(', ')
      : null;

    const product = await this.prisma.product.create({
      data: {
        seller_id: userId,
        title,
        description,
        price,
        category,
        status,
        review_reason: reviewReason,
        condition: condition || 'USED',
        trade_method: trade_method || 'BOTH',
        trade_location,
        brand_id,
        images: images
          ? {
            create: images.map((img) => ({
              url: img.url,
              key: img.key,
              order: img.order,
              is_primary: img.is_primary,
            })),
          }
          : undefined,
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
          },
        },
        images: true,
      },
    });

    // 해시태그 동기화
    if (hashtags && hashtags.length > 0) {
      await this.hashtagsService.syncHashtags(product.id, hashtags);
    }

    // 검토가 필요하지 않은 경우에만 알림 전송 (FOR_SALE 상태)
    if (status === 'FOR_SALE') {
      // 키워드 알림 확인 및 전송 (비동기)
      this.keywordAlertsService.checkAndNotify(
        product.id,
        title,
        category,
        price,
      ).catch(err => console.error('Failed to send keyword alerts:', err));

      // 팔로워들에게 알림 전송 (비동기)
      this.notifyFollowers(userId, product.id, title)
        .catch(err => console.error('Failed to notify followers:', err));
    }

    return product;
  }

  // 팔로워들에게 새 상품 등록 알림
  private async notifyFollowers(sellerId: string, productId: string, productTitle: string) {
    // 판매자의 팔로워 목록 조회
    const followers = await this.prisma.follow.findMany({
      where: { following_id: sellerId },
      select: {
        follower_id: true,
        follower: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    if (followers.length === 0) {
      return;
    }

    // 판매자 정보 조회
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { nickname: true },
    });

    if (!seller) {
      return;
    }

    // 각 팔로워에게 알림 생성
    const notifications = followers.map((follow) => {
      return this.notificationsService.create({
        userId: follow.follower_id,
        type: NotificationType.FOLLOWED_USER_PRODUCT,
        title: '팔로우한 판매자의 새 상품',
        message: `${seller.nickname}님이 새로운 상품 "${productTitle}"을 등록했습니다.`,
        relatedId: productId,
        relatedType: RelatedType.PRODUCT,
      });
    });

    await Promise.all(notifications);
  }

  async findAll(queryDto: QueryProductDto) {
    const {
      category,
      status,
      search,
      minPrice,
      maxPrice,
      condition,
      trade_method,
      brand_id,
      hashtag,
      seller_id,
      exclude,
      sort = 'latest',
      page = 1,
      limit = 20,
    } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 판매자 필터
    if (seller_id) {
      where.seller_id = seller_id;
    }

    // 제외할 상품
    if (exclude) {
      where.id = { not: exclude };
    }

    if (category) {
      where.category = category;
    }

    // status가 명시적으로 지정되면 그 상태만, 아니면 공개 가능한 상태만 (FOR_SALE, SOLD)
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['FOR_SALE', 'SOLD'] };
    }

    // 가격 필터
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // 상품 상태 필터
    if (condition) {
      where.condition = condition;
    }

    // 거래 방법 필터
    if (trade_method) {
      where.trade_method = trade_method;
    }

    // 브랜드 필터
    if (brand_id) {
      where.brand_id = brand_id;
    }

    // 해시태그 필터
    if (hashtag) {
      const hashtagName = hashtag.toLowerCase().replace(/^#/, '');
      const hashtagData = await this.prisma.hashtag.findUnique({
        where: { name: hashtagName },
        select: { id: true },
      });

      if (hashtagData) {
        where.hashtags = {
          some: {
            hashtag_id: hashtagData.id,
          },
        };
      } else {
        // 해시태그가 존재하지 않으면 빈 결과 반환
        return {
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 정렬 옵션 설정
    const orderByMap: Record<string, any> = {
      latest: { created_at: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      popular: [{ view_count: 'desc' }, { favorite_count: 'desc' }],
    };
    const orderBy = orderByMap[sort] || { created_at: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              nickname: true,
              avatar_url: true,
            },
          },
          images: {
            where: { is_primary: true },
            take: 1,
          },
          brand: {
            select: {
              id: true,
              name: true,
              name_ko: true,
              logo_url: true,
            },
          },
          hashtags: {
            include: {
              hashtag: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string | null, userRole?: string | null) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        brand: {
          select: {
            id: true,
            name: true,
            name_ko: true,
            logo_url: true,
          },
        },
        hashtags: {
          include: {
            hashtag: {
              select: {
                id: true,
                name: true,
                use_count: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 검토 대기 또는 거절된 상품은 소유자나 관리자만 조회 가능
    const isOwner = userId && product.seller_id === userId;
    const isAdmin = userRole === 'ADMIN';

    if ((product.status === 'PENDING_REVIEW' || product.status === 'REJECTED') && !isOwner && !isAdmin) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 조회수 증가 (비동기, 응답 속도에 영향 없도록) - 정상 상품만
    if (product.status === 'FOR_SALE' || product.status === 'SOLD') {
      this.prisma.product.update({
        where: { id },
        data: { view_count: { increment: 1 } },
      }).catch(err => console.error('Failed to increment view count:', err));

      // 최근 본 상품 기록 추가 (로그인한 사용자만)
      if (userId) {
        this.recentViewsService.addView(userId, id)
          .catch(err => console.error('Failed to add recent view:', err));
      }
    }

    return product;
  }

  async update(id: string, userId: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    if (product.seller_id !== userId) {
      throw new ForbiddenException('상품을 수정할 권한이 없습니다');
    }

    const { hashtags, ...productData } = updateProductDto;

    // 가격 인하 감지 및 original_price 저장
    let isPriceDropped = false;
    if (updateProductDto.price !== undefined && updateProductDto.price < product.price) {
      isPriceDropped = true;
      // 최초 가격 인하인 경우 원래 가격 저장
      if (!product.original_price) {
        (productData as any).original_price = product.price;
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: productData,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            nickname: true,
            avatar_url: true,
          },
        },
        images: true,
        brand: {
          select: {
            id: true,
            name: true,
            name_ko: true,
            logo_url: true,
          },
        },
      },
    });

    // 해시태그 업데이트
    if (hashtags !== undefined) {
      await this.hashtagsService.syncHashtags(id, hashtags);
    }

    // 가격 인하 시 찜한 사용자들에게 알림 (비동기)
    if (isPriceDropped) {
      this.notifyPriceDrop(id, product.title, product.price, updateProductDto.price!)
        .catch(err => console.error('Failed to notify price drop:', err));
    }

    return updatedProduct;
  }

  // 가격 인하 알림
  private async notifyPriceDrop(
    productId: string,
    productTitle: string,
    originalPrice: number,
    newPrice: number,
  ) {
    // 해당 상품을 찜한 사용자들 조회
    const favorites = await this.prisma.favorite.findMany({
      where: { product_id: productId },
      select: {
        user_id: true,
      },
    });

    if (favorites.length === 0) {
      return;
    }

    const discountAmount = originalPrice - newPrice;
    const discountRate = Math.round((discountAmount / originalPrice) * 100);

    // 각 사용자에게 알림 생성
    const notifications = favorites.map((favorite) => {
      return this.notificationsService.create({
        userId: favorite.user_id,
        type: 'PRICE_DROP' as NotificationType,
        title: '가격 인하 알림',
        message: `찜한 상품 "${productTitle}"의 가격이 ${discountRate}% 인하되었습니다! (${originalPrice.toLocaleString()}원 → ${newPrice.toLocaleString()}원)`,
        relatedId: productId,
        relatedType: RelatedType.PRODUCT,
      });
    });

    await Promise.all(notifications);
  }

  async purchase(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    if (product.status !== 'FOR_SALE') {
      throw new ForbiddenException('판매중인 상품이 아닙니다');
    }

    if (product.seller_id === userId) {
      throw new ForbiddenException('본인의 상품은 구매할 수 없습니다');
    }

    // 현재 수수료율 조회
    const commissionSettings = await this.commissionService.getCurrentRate();
    const commissionRate = commissionSettings.commission_rate;
    const commissionAmount = Math.floor((product.price * commissionRate) / 100);
    const sellerAmount = product.price - commissionAmount;

    // 트랜잭션으로 상품 상태 변경 및 거래 기록 생성
    const [updatedProduct, transaction] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: { status: 'SOLD' },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              nickname: true,
              avatar_url: true,
            },
          },
          images: true,
        },
      }),
      this.prisma.transaction.create({
        data: {
          product_id: id,
          seller_id: product.seller_id,
          buyer_id: userId,
          product_price: product.price,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          seller_amount: sellerAmount,
          status: 'COMPLETED',
        },
      }),
    ]);

    return updatedProduct;
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 관리자이거나 본인의 상품만 삭제 가능
    if (userRole !== 'ADMIN' && product.seller_id !== userId) {
      throw new ForbiddenException('상품을 삭제할 권한이 없습니다');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: '상품이 삭제되었습니다' };
  }

  async findMyProducts(userId: string, queryDto: QueryProductDto) {
    const { status, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { seller_id: userId };

    if (status) {
      where.status = status;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          images: {
            where: { is_primary: true },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
