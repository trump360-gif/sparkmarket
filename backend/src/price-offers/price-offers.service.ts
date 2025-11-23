import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceOfferDto } from './dto/create-price-offer.dto';

@Injectable()
export class PriceOffersService {
  constructor(private prisma: PrismaService) {}

  async createOffer(
    buyerId: string,
    productId: string,
    createDto: CreatePriceOfferDto,
  ) {
    // 상품 존재 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // 판매 상태 확인
    if (product.status !== 'FOR_SALE') {
      throw new BadRequestException('판매중인 상품만 가격 제안이 가능합니다.');
    }

    // 자기 상품에는 제안 불가
    if (product.seller_id === buyerId) {
      throw new BadRequestException('본인의 상품에는 가격 제안을 할 수 없습니다.');
    }

    // 제안 가격이 원가보다 높으면 안됨
    if (createDto.offered_price >= product.price) {
      throw new BadRequestException(
        '제안 가격은 판매 가격보다 낮아야 합니다.',
      );
    }

    // 만료 시간 설정 (72시간 후)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    // 가격 제안 생성
    const offer = await this.prisma.priceOffer.create({
      data: {
        buyer_id: buyerId,
        seller_id: product.seller_id,
        product_id: productId,
        offered_price: createDto.offered_price,
        message: createDto.message,
        expires_at: expiresAt,
      },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
        product: {
          include: {
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      },
    });

    return offer;
  }

  async acceptOffer(sellerId: string, offerId: string) {
    const offer = await this.prisma.priceOffer.findUnique({
      where: { id: offerId },
      include: { product: true },
    });

    if (!offer) {
      throw new NotFoundException('가격 제안을 찾을 수 없습니다.');
    }

    // 판매자 확인
    if (offer.seller_id !== sellerId) {
      throw new ForbiddenException('본인의 상품에 대한 제안만 수락할 수 있습니다.');
    }

    // 상태 확인
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('대기중인 제안만 수락할 수 있습니다.');
    }

    // 만료 확인
    if (new Date() > offer.expires_at) {
      await this.prisma.priceOffer.update({
        where: { id: offerId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('만료된 제안입니다.');
    }

    // 제안 수락 (상품 가격은 그대로 유지, 제안만 수락 상태로 변경)
    const updatedOffer = await this.prisma.priceOffer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
        product: true,
      },
    });

    // 같은 상품에 대한 다른 대기중인 제안들을 거절 처리
    await this.prisma.priceOffer.updateMany({
      where: {
        product_id: offer.product_id,
        id: { not: offerId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    return updatedOffer;
  }

  async rejectOffer(sellerId: string, offerId: string) {
    const offer = await this.prisma.priceOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('가격 제안을 찾을 수 없습니다.');
    }

    // 판매자 확인
    if (offer.seller_id !== sellerId) {
      throw new ForbiddenException('본인의 상품에 대한 제안만 거절할 수 있습니다.');
    }

    // 상태 확인
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('대기중인 제안만 거절할 수 있습니다.');
    }

    // 제안 거절
    const updatedOffer = await this.prisma.priceOffer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
        product: true,
      },
    });

    return updatedOffer;
  }

  async getReceivedOffers(
    sellerId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      this.prisma.priceOffer.findMany({
        where: { seller_id: sellerId },
        include: {
          buyer: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
          product: {
            include: {
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.priceOffer.count({
        where: { seller_id: sellerId },
      }),
    ]);

    return {
      data: offers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSentOffers(buyerId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      this.prisma.priceOffer.findMany({
        where: { buyer_id: buyerId },
        include: {
          seller: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
            },
          },
          product: {
            include: {
              images: {
                where: { is_primary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.priceOffer.count({
        where: { buyer_id: buyerId },
      }),
    ]);

    return {
      data: offers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductOffers(productId: string) {
    const offers = await this.prisma.priceOffer.findMany({
      where: { product_id: productId },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
    });

    return offers;
  }
}
