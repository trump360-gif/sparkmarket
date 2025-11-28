import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // 전체 카테고리를 계층 구조로 조회
    const categories = await this.prisma.category.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      include: {
        children: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
        _count: {
          select: { children: true },
        },
      },
    });

    // 최상위 카테고리만 반환 (parent_id가 null인 것)
    const rootCategories = categories.filter((cat) => !cat.parent_id);

    return rootCategories;
  }

  async findOne(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' },
        },
        _count: {
          select: { children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    return category;
  }

  async findCategoryProducts(
    slug: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    const skip = (page - 1) * limit;

    // 해당 카테고리와 하위 카테고리의 상품 조회
    const childCategories = await this.prisma.category.findMany({
      where: { parent_id: category.id },
      select: { name: true },
    });

    const categoryNames = [
      category.name,
      ...childCategories.map((c) => c.name),
    ];

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          category: { in: categoryNames },
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
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({
        where: {
          category: { in: categoryNames },
          status: 'FOR_SALE',
        },
      }),
    ]);

    return {
      category,
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    // slug 중복 체크
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException('이미 존재하는 slug입니다.');
    }

    // parent_id가 있으면 부모 카테고리 존재 확인
    if (createCategoryDto.parent_id) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('부모 카테고리를 찾을 수 없습니다.');
      }
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // slug 변경 시 중복 체크
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new BadRequestException('이미 존재하는 slug입니다.');
      }
    }

    // parent_id 변경 시 순환 참조 체크
    if (updateCategoryDto.parent_id) {
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('자기 자신을 부모로 설정할 수 없습니다.');
      }

      const parent = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parent_id },
      });

      if (!parent) {
        throw new NotFoundException('부모 카테고리를 찾을 수 없습니다.');
      }

      // 부모의 부모가 자신인지 체크 (순환 참조 방지)
      if (parent.parent_id === id) {
        throw new BadRequestException('순환 참조가 발생합니다.');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // 하위 카테고리가 있으면 삭제 불가
    if (category.children.length > 0) {
      throw new BadRequestException(
        '하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.',
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: '카테고리가 삭제되었습니다.' };
  }

  async reorder(reorderCategoriesDto: ReorderCategoriesDto) {
    // 트랜잭션으로 여러 카테고리의 순서를 한번에 업데이트
    await this.prisma.$transaction(
      reorderCategoriesDto.categories.map((cat) =>
        this.prisma.category.update({
          where: { id: cat.id },
          data: { sort_order: cat.sort_order },
        }),
      ),
    );

    return { message: '카테고리 순서가 변경되었습니다.' };
  }
}
