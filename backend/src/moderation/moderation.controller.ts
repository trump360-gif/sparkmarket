import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

class AddWordDto {
  word: string;
  category: string;
}

class AddWordsDto {
  words: { word: string; category: string }[];
}

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  /**
   * 카테고리 목록 조회
   */
  @Get('categories')
  getCategories() {
    return this.moderationService.getCategories();
  }

  // ============= 금지어 관리 =============

  /**
   * 금지어 목록 조회
   */
  @Get('banned-words')
  async getBannedWords(@Query('category') category?: string) {
    const words = await this.moderationService.getBannedWords(category);
    return { words };
  }

  /**
   * 금지어 추가
   */
  @Post('banned-words')
  async addBannedWord(
    @Body() dto: AddWordDto,
    @Request() req: { user: { sub: string } },
  ) {
    const word = await this.moderationService.addBannedWord(
      dto.word,
      dto.category,
      req.user?.sub,
    );
    return { success: true, word };
  }

  /**
   * 금지어 일괄 추가
   */
  @Post('banned-words/bulk')
  async addBannedWords(
    @Body() dto: AddWordsDto,
    @Request() req: { user: { sub: string } },
  ) {
    const words = await this.moderationService.addBannedWords(dto.words, req.user?.sub);
    return { success: true, count: words.length, words };
  }

  /**
   * 금지어 삭제
   */
  @Delete('banned-words/:id')
  async deleteBannedWord(@Param('id') id: string) {
    await this.moderationService.deleteBannedWord(id);
    return { success: true };
  }

  // ============= 의심 키워드 관리 =============

  /**
   * 의심 키워드 목록 조회
   */
  @Get('suspicious-words')
  async getSuspiciousWords(@Query('category') category?: string) {
    const words = await this.moderationService.getSuspiciousWords(category);
    return { words };
  }

  /**
   * 의심 키워드 추가
   */
  @Post('suspicious-words')
  async addSuspiciousWord(
    @Body() dto: AddWordDto,
    @Request() req: { user: { sub: string } },
  ) {
    const word = await this.moderationService.addSuspiciousWord(
      dto.word,
      dto.category,
      req.user?.sub,
    );
    return { success: true, word };
  }

  /**
   * 의심 키워드 일괄 추가
   */
  @Post('suspicious-words/bulk')
  async addSuspiciousWords(
    @Body() dto: AddWordsDto,
    @Request() req: { user: { sub: string } },
  ) {
    const words = await this.moderationService.addSuspiciousWords(dto.words, req.user?.sub);
    return { success: true, count: words.length, words };
  }

  /**
   * 의심 키워드 삭제
   */
  @Delete('suspicious-words/:id')
  async deleteSuspiciousWord(@Param('id') id: string) {
    await this.moderationService.deleteSuspiciousWord(id);
    return { success: true };
  }
}
