import { Module } from '@nestjs/common';
import { RecentViewsController } from './recent-views.controller';
import { RecentViewsService } from './recent-views.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RecentViewsController],
  providers: [RecentViewsService, PrismaService],
  exports: [RecentViewsService],
})
export class RecentViewsModule {}
