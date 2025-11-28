import { Module } from '@nestjs/common';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [FollowsController],
  providers: [FollowsService, PrismaService, NotificationsService],
  exports: [FollowsService],
})
export class FollowsModule {}
