import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async blockUser(blockerId: string, blockedId: string) {
    // 자기 자신을 차단할 수 없음
    if (blockerId === blockedId) {
      throw new BadRequestException('자기 자신을 차단할 수 없습니다.');
    }

    // 차단할 사용자 존재 확인
    const blockedUser = await this.prisma.user.findUnique({
      where: { id: blockedId },
    });

    if (!blockedUser) {
      throw new NotFoundException('차단할 사용자를 찾을 수 없습니다.');
    }

    // 이미 차단된 사용자인지 확인
    const existingBlock = await this.prisma.block.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      },
    });

    if (existingBlock) {
      throw new ConflictException('이미 차단한 사용자입니다.');
    }

    const block = await this.prisma.block.create({
      data: {
        blocker_id: blockerId,
        blocked_id: blockedId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            nickname: true,
            avatar_url: true,
          },
        },
      },
    });

    return {
      message: '사용자를 차단했습니다.',
      block,
    };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const block = await this.prisma.block.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      },
    });

    if (!block) {
      throw new NotFoundException('차단 내역을 찾을 수 없습니다.');
    }

    await this.prisma.block.delete({
      where: {
        id: block.id,
      },
    });

    return {
      message: '차단을 해제했습니다.',
    };
  }

  async getBlockedUsers(blockerId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [blocks, total] = await Promise.all([
      this.prisma.block.findMany({
        where: { blocker_id: blockerId },
        include: {
          blocked: {
            select: {
              id: true,
              nickname: true,
              avatar_url: true,
              bio: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.block.count({
        where: { blocker_id: blockerId },
      }),
    ]);

    const users = blocks.map((block) => ({
      ...block.blocked,
      blocked_at: block.created_at,
    }));

    return {
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkBlock(blockerId: string, blockedId: string) {
    const block = await this.prisma.block.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      },
    });

    return {
      isBlocked: !!block,
    };
  }

  // 양방향 차단 확인 (A가 B를 차단했거나 B가 A를 차단한 경우)
  async checkMutualBlock(userId1: string, userId2: string) {
    const blocks = await this.prisma.block.findMany({
      where: {
        OR: [
          {
            blocker_id: userId1,
            blocked_id: userId2,
          },
          {
            blocker_id: userId2,
            blocked_id: userId1,
          },
        ],
      },
    });

    return {
      isBlocked: blocks.length > 0,
      blockedBy: blocks.length > 0 ? blocks[0].blocker_id : null,
    };
  }
}
