import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PriceOffersService } from './price-offers.service';
import { CreatePriceOfferDto } from './dto/create-price-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('price-offers')
@UseGuards(JwtAuthGuard)
export class PriceOffersController {
  constructor(private readonly priceOffersService: PriceOffersService) {}

  @Post('products/:productId')
  async createOffer(
    @Request() req,
    @Param('productId') productId: string,
    @Body() createDto: CreatePriceOfferDto,
  ) {
    return this.priceOffersService.createOffer(
      req.user.id,
      productId,
      createDto,
    );
  }

  @Patch(':offerId/accept')
  async acceptOffer(@Request() req, @Param('offerId') offerId: string) {
    return this.priceOffersService.acceptOffer(req.user.id, offerId);
  }

  @Patch(':offerId/reject')
  async rejectOffer(@Request() req, @Param('offerId') offerId: string) {
    return this.priceOffersService.rejectOffer(req.user.id, offerId);
  }

  @Get('received')
  async getReceivedOffers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.priceOffersService.getReceivedOffers(
      req.user.id,
      page,
      limit,
    );
  }

  @Get('sent')
  async getSentOffers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.priceOffersService.getSentOffers(req.user.id, page, limit);
  }

  @Get('products/:productId')
  async getProductOffers(@Param('productId') productId: string) {
    return this.priceOffersService.getProductOffers(productId);
  }
}
