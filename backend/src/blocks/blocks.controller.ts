import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post(':userId')
  async blockUser(@Request() req, @Param('userId') userId: string) {
    return this.blocksService.blockUser(req.user.id, userId);
  }

  @Delete(':userId')
  async unblockUser(@Request() req, @Param('userId') userId: string) {
    return this.blocksService.unblockUser(req.user.id, userId);
  }

  @Get()
  async getBlockedUsers(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.blocksService.getBlockedUsers(req.user.id, page, limit);
  }

  @Get('check/:userId')
  async checkBlock(@Request() req, @Param('userId') userId: string) {
    return this.blocksService.checkBlock(req.user.id, userId);
  }
}
