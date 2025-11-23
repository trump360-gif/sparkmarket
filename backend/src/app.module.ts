import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { ImagesModule } from './images/images.module';
import { AdminModule } from './admin/admin.module';
import { CommissionModule } from './commission/commission.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PriceOffersModule } from './price-offers/price-offers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    ImagesModule,
    AdminModule,
    CommissionModule,
    FavoritesModule,
    PriceOffersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
