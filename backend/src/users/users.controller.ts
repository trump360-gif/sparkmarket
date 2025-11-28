import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FollowsService } from '../follows/follows.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followsService: FollowsService,
  ) {}

  // 현재 로그인한 사용자 프로필 조회
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  // 현재 로그인한 사용자 프로필 수정
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMyProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  // 특정 사용자 프로필 조회 (공개)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }

  // 특정 사용자 받은 리뷰 목록
  @Get(':id/reviews')
  async getUserReviews(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.getUserReviews(id, +page, +limit);
  }

  // 내 거래 내역 조회
  @UseGuards(JwtAuthGuard)
  @Get('me/transactions')
  async getMyTransactions(
    @Request() req,
    @Query('type') type: 'all' | 'sold' | 'bought' = 'all',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.getMyTransactions(req.user.id, type, +page, +limit);
  }

  // 특정 유저의 팔로워 목록
  @Get(':userId/followers')
  async getUserFollowers(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getUserFollowers(userId, page, limit);
  }

  // 특정 유저의 팔로잉 목록
  @Get(':userId/following')
  async getUserFollowing(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getUserFollowing(userId, page, limit);
  }
}
