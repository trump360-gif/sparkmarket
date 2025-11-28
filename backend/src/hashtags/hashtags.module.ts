import { Module } from '@nestjs/common';
import { HashtagsController } from './hashtags.controller';
import { HashtagsService } from './hashtags.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [HashtagsController],
  providers: [HashtagsService, PrismaService],
  exports: [HashtagsService],
})
export class HashtagsModule {}
