import { Controller, Post, Body, Delete, Param, UseGuards, Request, Put, Query, Req, BadRequestException } from '@nestjs/common';
import { ImagesService } from './images.service';
import { UploadPresignedUrlDto } from './dto/upload-presigned-url.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  // Local Upload Endpoint (Development Only)
  @Put('local-upload')
  async uploadLocalFile(@Query('key') key: string, @Req() req: any) {
    if (!key) throw new BadRequestException('Key is required');

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, key);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file stream
    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve({ message: 'Upload successful' }));
      writeStream.on('error', reject);
    });
  }

  @Post('presigned-url')
  @UseGuards(JwtAuthGuard)
  generatePresignedUrl(@Body() uploadDto: UploadPresignedUrlDto) {
    return this.imagesService.generatePresignedUrl(uploadDto, 'product');
  }

  @Post('avatar-presigned-url')
  @UseGuards(JwtAuthGuard)
  generateAvatarPresignedUrl(@Body() uploadDto: UploadPresignedUrlDto) {
    return this.imagesService.generatePresignedUrl(uploadDto, 'avatar');
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
