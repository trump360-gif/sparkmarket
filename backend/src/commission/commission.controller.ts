import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { UpdateCommissionRateDto } from './dto/update-commission-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/commission')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('rate')
  getCurrentRate() {
    return this.commissionService.getCurrentRate();
  }

  @Put('rate')
  updateRate(@Body() updateDto: UpdateCommissionRateDto) {
    return this.commissionService.updateRate(updateDto);
  }

  @Get('statistics')
  getStatistics() {
    return this.commissionService.getStatistics();
  }

  @Get('transactions')
  getTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commissionService.getTransactions(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
