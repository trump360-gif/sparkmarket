import { Module } from '@nestjs/common';
import { BrandsController, AdminBrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService, PrismaService],
  exports: [BrandsService],
})
export class BrandsModule {}
