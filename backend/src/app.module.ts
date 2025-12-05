import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecentViewsModule } from './recent-views/recent-views.module';
import { KeywordAlertsModule } from './keyword-alerts/keyword-alerts.module';
import { FollowsModule } from './follows/follows.module';
import { ReportsModule } from './reports/reports.module';
import { BlocksModule } from './blocks/blocks.module';
import { BrandsModule } from './brands/brands.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    ImagesModule,
    AdminModule,
    CommissionModule,
    FavoritesModule,
    PriceOffersModule,
    UsersModule,
    ReviewsModule,
    NotificationsModule,
    RecentViewsModule,
    KeywordAlertsModule,
    FollowsModule,
    ReportsModule,
    BlocksModule,
    BrandsModule,
    HashtagsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

