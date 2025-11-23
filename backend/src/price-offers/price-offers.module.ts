import { Module } from '@nestjs/common';
import { PriceOffersController } from './price-offers.controller';
import { PriceOffersService } from './price-offers.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PriceOffersController],
  providers: [PriceOffersService, PrismaService],
  exports: [PriceOffersService],
})
export class PriceOffersModule {}
