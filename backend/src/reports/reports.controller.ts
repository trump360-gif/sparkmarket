import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReport(@Request() req, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.createReport(req.user.id, createReportDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyReports(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query() queryDto: QueryReportDto,
  ) {
    return this.reportsService.getMyReports(req.user.id, page, limit, queryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReport(@Request() req, @Param('id') id: string) {
    return this.reportsService.deleteReport(id, req.user.id);
  }
}

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getAllReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query() queryDto: QueryReportDto,
  ) {
    return this.reportsService.getAllReports(page, limit, queryDto);
  }

  @Get(':id')
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }

  @Patch(':id')
  async updateReport(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportsService.updateReport(id, req.user.id, updateReportDto);
  }
}
