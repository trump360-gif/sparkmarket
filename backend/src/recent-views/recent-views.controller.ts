import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { RecentViewsService } from './recent-views.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recent-views')
export class RecentViewsController {
  constructor(private readonly recentViewsService: RecentViewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRecentViews(
    @Request() req,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    // 최대 50개로 제한
    const maxLimit = Math.min(limit, 50);
    return this.recentViewsService.getRecentViews(req.user.id, maxLimit);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteAll(@Request() req) {
    return this.recentViewsService.deleteAll(req.user.id);
  }

  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async deleteOne(@Request() req, @Param('productId') productId: string) {
    return this.recentViewsService.deleteOne(req.user.id, productId);
  }
}
