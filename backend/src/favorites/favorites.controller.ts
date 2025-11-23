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
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:productId')
  async toggleFavorite(@Request() req, @Param('productId') productId: string) {
    return this.favoritesService.toggleFavorite(req.user.id, productId);
  }

  @Get('check/:productId')
  async checkFavorite(@Request() req, @Param('productId') productId: string) {
    return this.favoritesService.checkFavorite(req.user.id, productId);
  }

  @Get()
  async getFavorites(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.favoritesService.getFavorites(req.user.id, page, limit);
  }
}
