import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationsService,
  NotificationType,
  RelatedType,
} from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 팔로우하기
  async followUser(followerId: string, followingId: string) {
    // 자기 자신을 팔로우할 수 없음
    if (followerId === followingId) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
    }

    // 팔로우 대상 유저 존재 확인
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, nickname: true },
    });

    if (!targetUser) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    // 이미 팔로우 중인지 확인
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('이미 팔로우 중입니다.');
    }

    // 팔로우 생성
    const follow = await this.prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    // 팔로우한 유저 정보 가져오기
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { nickname: true },
    });

    if (follower) {
      // 알림 생성 (NEW_FOLLOWER)
      await this.notificationsService.create({
        userId: followingId,
        type: NotificationType.NEW_FOLLOWER,
        title: '새로운 팔로워',
        message: `${follower.nickname}님이 회원님을 팔로우하기 시작했습니다.`,
        relatedId: followerId,
        relatedType: RelatedType.USER,
      });
    }

    return { message: '팔로우했습니다.', isFollowing: true };
  }

  // 언팔로우
  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('팔로우하지 않은 유저입니다.');
    }

    await this.prisma.follow.delete({
      where: { id: follow.id },
    });

    return { message: '언팔로우했습니다.', isFollowing: false };
  }

  // 팔로우 여부 확인
  async checkFollowing(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    return { isFollowing: !!follow };
  }

  // 내 팔로워 목록
  async getMyFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { following_id: userId },
        include: {
          follower: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
              bio: true,
              _count: {
                select: {
                  products: {
                    where: { status: 'FOR_SALE' },
                  },
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.follow.count({
        where: { following_id: userId },
      }),
    ]);

    const followers = follows.map((follow) => ({
      ...follow.follower,
      followedAt: follow.created_at,
    }));

    return {
      data: followers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 내가 팔로우하는 목록
  async getMyFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { follower_id: userId },
        include: {
          following: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
              bio: true,
              _count: {
                select: {
                  products: {
                    where: { status: 'FOR_SALE' },
                  },
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.follow.count({
        where: { follower_id: userId },
      }),
    ]);

    const following = follows.map((follow) => ({
      ...follow.following,
      followedAt: follow.created_at,
    }));

    return {
      data: following,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 특정 유저의 팔로워 목록
  async getUserFollowers(
    targetUserId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // 유저 존재 확인
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { following_id: targetUserId },
        include: {
          follower: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
              bio: true,
              _count: {
                select: {
                  products: {
                    where: { status: 'FOR_SALE' },
                  },
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.follow.count({
        where: { following_id: targetUserId },
      }),
    ]);

    const followers = follows.map((follow) => ({
      ...follow.follower,
      followedAt: follow.created_at,
    }));

    return {
      data: followers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 특정 유저가 팔로우하는 목록
  async getUserFollowing(
    targetUserId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // 유저 존재 확인
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { follower_id: targetUserId },
        include: {
          following: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
              bio: true,
              _count: {
                select: {
                  products: {
                    where: { status: 'FOR_SALE' },
                  },
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.follow.count({
        where: { follower_id: targetUserId },
      }),
    ]);

    const following = follows.map((follow) => ({
      ...follow.following,
      followedAt: follow.created_at,
    }));

    return {
      data: following,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 팔로우한 사람들의 최신 상품 피드
  async getFollowingFeed(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    // 내가 팔로우하는 유저 ID 목록 가져오기
    const followingUsers = await this.prisma.follow.findMany({
      where: { follower_id: userId },
      select: { following_id: true },
    });

    const followingIds = followingUsers.map((f) => f.following_id);

    if (followingIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }

    // 팔로우한 유저들의 최신 상품 가져오기
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          seller_id: { in: followingIds },
          status: 'FOR_SALE',
        },
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
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          seller_id: { in: followingIds },
          status: 'FOR_SALE',
        },
      }),
    ]);

    return {
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
