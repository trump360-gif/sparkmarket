import { Controller, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ImagesService } from './images.service';
import { UploadPresignedUrlDto } from './dto/upload-presigned-url.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  generatePresignedUrl(@Body() uploadDto: UploadPresignedUrlDto) {
    return this.imagesService.generatePresignedUrl(uploadDto);
  }

  @Post('product-image')
  @UseGuards(JwtAuthGuard)
  addProductImage(@Body() addImageDto: AddProductImageDto) {
    return this.imagesService.addProductImage(addImageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteProductImage(@Param('id') id: string, @Request() req) {
    return this.imagesService.deleteProductImage(id, req.user.id);
  }
}
