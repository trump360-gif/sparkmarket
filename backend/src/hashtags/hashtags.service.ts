import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HashtagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [hashtags, total] = await Promise.all([
      this.prisma.hashtag.findMany({
        orderBy: { use_count: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      this.prisma.hashtag.count(),
    ]);

    return {
      data: hashtags,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPopular(limit: number = 20) {
    return this.prisma.hashtag.findMany({
      orderBy: { use_count: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async search(query: string, limit: number = 20) {
    return this.prisma.hashtag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { use_count: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findHashtagProducts(
    name: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const hashtag = await this.prisma.hashtag.findUnique({
      where: { name },
    });

    if (!hashtag) {
      throw new NotFoundException('해시태그를 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    const [productHashtags, total] = await Promise.all([
      this.prisma.productHashtag.findMany({
        where: {
          hashtag_id: hashtag.id,
          product: { status: 'FOR_SALE' },
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: { order: 'asc' },
              },
              seller: {
                select: {
                  id: true,
                  nickname: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.productHashtag.count({
        where: {
          hashtag_id: hashtag.id,
          product: { status: 'FOR_SALE' },
        },
      }),
    ]);

    const products = productHashtags.map((ph) => ph.product);

    return {
      hashtag,
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 상품의 해시태그를 동기화합니다.
   * 기존 해시태그를 모두 제거하고 새로운 해시태그로 교체합니다.
   * @param productId 상품 ID
   * @param hashtagNames 해시태그 이름 배열 (# 없이)
   */
  async syncHashtags(productId: string, hashtagNames: string[]) {
    // 기존 연결 삭제
    await this.prisma.productHashtag.deleteMany({
      where: { product_id: productId },
    });

    if (!hashtagNames || hashtagNames.length === 0) {
      return [];
    }

    // 중복 제거 및 정규화
    const uniqueHashtags = [...new Set(hashtagNames)]
      .map((name) => name.trim().toLowerCase().replace(/^#/, ''))
      .filter((name) => name.length > 0 && name.length <= 30);

    // 해시태그 찾기 또는 생성
    const hashtags = await Promise.all(
      uniqueHashtags.map(async (name) => {
        // 기존 해시태그 찾기
        let hashtag = await this.prisma.hashtag.findUnique({
          where: { name },
        });

        // 없으면 생성
        if (!hashtag) {
          hashtag = await this.prisma.hashtag.create({
            data: { name, use_count: 0 },
          });
        }

        // 사용 횟수 증가
        hashtag = await this.prisma.hashtag.update({
          where: { id: hashtag.id },
          data: { use_count: { increment: 1 } },
        });

        return hashtag;
      }),
    );

    // 상품-해시태그 연결 생성
    await Promise.all(
      hashtags.map((hashtag) =>
        this.prisma.productHashtag.create({
          data: {
            product_id: productId,
            hashtag_id: hashtag.id,
          },
        }),
      ),
    );

    return hashtags;
  }

  /**
   * 텍스트에서 해시태그 추출
   * 예: "멋진 #나이키 #운동화" -> ["나이키", "운동화"]
   */
  parseHashtags(text: string): string[] {
    if (!text) {
      return [];
    }

    const hashtagRegex = /#([a-zA-Z0-9가-힣_]+)/g;
    const matches = text.match(hashtagRegex);

    if (!matches) {
      return [];
    }

    return matches.map((tag) => tag.replace(/^#/, '').toLowerCase());
  }

  /**
   * 인기 해시태그 조회 (기존 메서드와 호환성 유지)
   * @param limit 가져올 개수
   */
  async getPopularHashtags(limit: number = 20) {
    return this.findPopular(limit);
  }

  /**
   * 해시태그로 상품 검색 (기존 메서드와 호환성 유지)
   * @param hashtagName 해시태그 이름
   */
  async findProductsByHashtag(hashtagName: string) {
    const result = await this.findHashtagProducts(hashtagName, 1, 100);
    return result.data;
  }

  /**
   * 사용되지 않는 해시태그 정리 (use_count가 0인 것들)
   */
  async cleanupUnusedHashtags() {
    const result = await this.prisma.hashtag.deleteMany({
      where: { use_count: 0 },
    });

    return {
      message: '사용되지 않는 해시태그를 정리했습니다.',
      deletedCount: result.count,
    };
  }
}
