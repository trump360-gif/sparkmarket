import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { QueryAdminDto } from './dto/query-admin.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { RejectProductDto } from './dto/review-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 대시보드 통계
  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // 최근 상품 목록 (대시보드용)
  @Get('dashboard/recent-products')
  getRecentProducts(@Query('limit') limit?: number) {
    return this.adminService.getRecentProducts(limit ? Number(limit) : 10);
  }

  // 전체 상품 관리
  @Get('products')
  getAllProducts(@Query() queryDto: QueryAdminDto) {
    const { page, limit, search, status } = queryDto;
    return this.adminService.getAllProducts(page, limit, search, status);
  }

  // 상품 삭제
  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // 전체 유저 관리
  @Get('users')
  getAllUsers(@Query() queryDto: QueryAdminDto) {
    const { page, limit, search, status } = queryDto;
    return this.adminService.getAllUsers(page, limit, search, status);
  }

  // 유저 상태 변경
  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, updateStatusDto.status);
  }

  // 유저 상세 정보
  @Get('users/:id')
  getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  // 검토 대기 상품 수 조회 (대시보드용)
  @Get('review/count')
  getPendingReviewCount() {
    return this.adminService.getPendingReviewCount();
  }

  // 검토 대기 상품 목록
  @Get('review/products')
  getPendingReviewProducts(@Query() queryDto: QueryAdminDto) {
    const { page, limit, search } = queryDto;
    return this.adminService.getPendingReviewProducts(page, limit, search);
  }

  // 검토 대기 상품 상세
  @Get('review/products/:id')
  getPendingReviewProduct(@Param('id') id: string) {
    return this.adminService.getPendingReviewProduct(id);
  }

  // 상품 검토 승인
  @Post('review/products/:id/approve')
  approveProduct(@Param('id') id: string, @Request() req) {
    return this.adminService.approveProduct(id, req.user.id);
  }

  // 상품 검토 거절
  @Post('review/products/:id/reject')
  rejectProduct(
    @Param('id') id: string,
    @Body() rejectDto: RejectProductDto,
    @Request() req,
  ) {
    return this.adminService.rejectProduct(id, req.user.id, rejectDto.reason);
  }

  // 상품 게시 중지
  @Patch('products/:id/suspend')
  suspendProduct(@Param('id') id: string) {
    return this.adminService.suspendProduct(id);
  }

  // 상품 게시 재개
  @Patch('products/:id/unsuspend')
  unsuspendProduct(@Param('id') id: string) {
    return this.adminService.unsuspendProduct(id);
  }
}
