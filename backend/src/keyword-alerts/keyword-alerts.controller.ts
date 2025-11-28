import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KeywordAlertsService } from './keyword-alerts.service';
import { CreateKeywordAlertDto } from './dto/create-keyword-alert.dto';
import { UpdateKeywordAlertDto } from './dto/update-keyword-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('keyword-alerts')
@UseGuards(JwtAuthGuard)
export class KeywordAlertsController {
  constructor(private readonly keywordAlertsService: KeywordAlertsService) {}

  @Post()
  create(@Request() req, @Body() createKeywordAlertDto: CreateKeywordAlertDto) {
    return this.keywordAlertsService.create(req.user.id, createKeywordAlertDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.keywordAlertsService.findAll(req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateKeywordAlertDto: UpdateKeywordAlertDto,
  ) {
    return this.keywordAlertsService.update(
      req.user.id,
      id,
      updateKeywordAlertDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.keywordAlertsService.remove(req.user.id, id);
  }

  @Patch(':id/toggle')
  toggle(@Request() req, @Param('id') id: string) {
    return this.keywordAlertsService.toggle(req.user.id, id);
  }
}
