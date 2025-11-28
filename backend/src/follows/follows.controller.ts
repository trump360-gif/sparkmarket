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
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  // 팔로우하기
  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  async followUser(@Request() req, @Param('userId') userId: string) {
    return this.followsService.followUser(req.user.id, userId);
  }

  // 언팔로우
  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    return this.followsService.unfollowUser(req.user.id, userId);
  }

  // 팔로우 여부 확인
  @Get('check/:userId')
  @UseGuards(JwtAuthGuard)
  async checkFollowing(@Request() req, @Param('userId') userId: string) {
    return this.followsService.checkFollowing(req.user.id, userId);
  }

  // 내 팔로워 목록
  @Get('followers')
  @UseGuards(JwtAuthGuard)
  async getMyFollowers(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getMyFollowers(req.user.id, page, limit);
  }

  // 내가 팔로우하는 목록
  @Get('following')
  @UseGuards(JwtAuthGuard)
  async getMyFollowing(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getMyFollowing(req.user.id, page, limit);
  }

  // 팔로우한 사람들의 최신 상품 피드
  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFollowingFeed(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getFollowingFeed(req.user.id, page, limit);
  }
}
