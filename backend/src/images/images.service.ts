import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadPresignedUrlDto } from './dto/upload-presigned-url.dto';
import { AddProductImageDto } from './dto/add-product-image.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImagesService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private isLocalMode: boolean = false;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const accountId = this.configService.get('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('R2_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get('R2_BUCKET_NAME') || 'sparkmarket';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn('⚠️ R2 credentials not found. Switching to Local Storage Mode.');
      this.isLocalMode = true;
    } else {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async generatePresignedUrl(uploadDto: UploadPresignedUrlDto) {
    // Local Mode handling
    if (this.isLocalMode) {
      const { filename } = uploadDto;
      const ext = filename.split('.').pop();
      const key = `products/${uuidv4()}.${ext}`;

      // Return a URL that the frontend will PUT to (mimicking S3)
      // We'll add an endpoint in the controller: /images/local-upload
      // NOTE: backend Global Prefix is 'api', so we must include it.
      const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3003';
      const presignedUrl = `${backendUrl}/api/images/local-upload?key=${key}`;
      const publicUrl = `${backendUrl}/uploads/${key}`;

      return {
        presignedUrl,
        key,
        publicUrl,
        expiresIn: 3600,
      };
    }

    if (!this.s3Client) {
      throw new BadRequestException('이미지 업로드 기능이 설정되지 않았습니다');
    }

    const { filename, contentType, fileSize } = uploadDto;

    // 파일 크기 제한 (10MB)
    if (fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('파일 크기는 10MB를 초과할 수 없습니다');
    }

    // 고유한 키 생성
    const ext = filename.split('.').pop();
    const key = `products/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    try {
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1시간
      });

      const publicUrl = `${this.configService.get('R2_PUBLIC_URL')}/${key}`;

      return {
        presignedUrl,
        key,
        publicUrl,
        expiresIn: 3600,
      };
    } catch (error) {
      console.error('Presigned URL 생성 실패:', error);
      throw new BadRequestException('Presigned URL 생성에 실패했습니다');
    }
  }

  async addProductImage(addImageDto: AddProductImageDto) {
    const { product_id, url, key, width, height, size, format, order, is_primary } = addImageDto;

    // 상품 존재 확인
    const product = await this.prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다');
    }

    // 이미지 추가
    const image = await this.prisma.productImage.create({
      data: {
        product_id,
        url,
        key,
        width,
        height,
        size,
        format,
        order: order ?? 0,
        is_primary: is_primary ?? false,
      },
    });

    return image;
  }

  async deleteProductImage(imageId: string, userId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
      include: {
        product: true,
      },
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다');
    }

    // 권한 확인
    if (image.product.seller_id !== userId) {
      throw new BadRequestException('이미지를 삭제할 권한이 없습니다');
    }

    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    return { message: '이미지가 삭제되었습니다' };
  }
}
