import { Module } from '@nestjs/common';
import { ReportsController, AdminReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ReportsController, AdminReportsController],
  providers: [ReportsService, PrismaService],
  exports: [ReportsService],
})
export class ReportsModule {}
