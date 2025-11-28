import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:productId')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@Request() req, @Param('productId') productId: string) {
    return this.favoritesService.toggleFavorite(req.user.id, productId);
  }

  @Get('check/:productId')
  async checkFavorite(@Request() req, @Param('productId') productId: string) {
    const userId = req.user?.id || null;
    return this.favoritesService.checkFavorite(userId, productId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFavorites(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.favoritesService.getFavorites(req.user.id, page, limit);
  }
}
