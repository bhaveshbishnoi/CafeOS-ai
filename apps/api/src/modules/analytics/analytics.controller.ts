import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('branches/:branchId/dashboard')
  async getDashboardStats(@Param('branchId') branchId: string) {
    return this.analyticsService.getDashboardStats(branchId);
  }

  @Get('compare')
  async getMultiBranchLeaderboard() {
    return this.analyticsService.getMultiBranchLeaderboard();
  }

  @Get('branches/:branchId/staff-metrics')
  async getStaffMetrics(@Param('branchId') branchId: string) {
    return this.analyticsService.getStaffMetrics(branchId);
  }

  @Get('branches/:branchId/expenses')
  async getExpenses(@Param('branchId') branchId: string) {
    return this.analyticsService.getExpenses(branchId);
  }

  @Post('branches/:branchId/expenses')
  async createExpense(
    @Param('branchId') branchId: string,
    @Body() data: any
  ) {
    return this.analyticsService.createExpense(branchId, data);
  }
}
