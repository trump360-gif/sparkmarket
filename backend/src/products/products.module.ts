import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommissionModule } from '../commission/commission.module';

@Module({
  imports: [PrismaModule, CommissionModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
