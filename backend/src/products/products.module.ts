import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommissionModule } from '../commission/commission.module';
import { ModerationModule } from '../moderation/moderation.module';
import { RecentViewsModule } from '../recent-views/recent-views.module';
import { HashtagsModule } from '../hashtags/hashtags.module';
import { KeywordAlertsModule } from '../keyword-alerts/keyword-alerts.module';
import { FollowsModule } from '../follows/follows.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    CommissionModule,
    ModerationModule,
    RecentViewsModule,
    HashtagsModule,
    KeywordAlertsModule,
    FollowsModule,
    NotificationsModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
