import { Module } from '@nestjs/common';
import {
  CategoriesController,
  AdminCategoriesController,
} from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService, PrismaService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
