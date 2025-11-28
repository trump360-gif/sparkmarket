import { Module } from '@nestjs/common';
import { KeywordAlertsController } from './keyword-alerts.controller';
import { KeywordAlertsService } from './keyword-alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [KeywordAlertsController],
  providers: [KeywordAlertsService, PrismaService],
  exports: [KeywordAlertsService],
})
export class KeywordAlertsModule {}
