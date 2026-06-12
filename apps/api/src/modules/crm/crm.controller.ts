import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private crmService: CrmService) {}

  @Get('branches/:branchId/customers')
  async getCustomers(@Param('branchId') branchId: string) {
    return this.crmService.getCustomers(branchId);
  }

  @Get('customers/:customerId')
  async getCustomer(@Param('customerId') customerId: string) {
    return this.crmService.getCustomer(customerId);
  }

  @Post('customers')
  async createCustomer(@Body() data: any) {
    return this.crmService.createCustomer(data);
  }

  @Get('branches/:branchId/campaigns')
  async getCampaigns(@Param('branchId') branchId: string) {
    return this.crmService.getCampaigns(branchId);
  }

  @Post('campaigns')
  async createCampaign(@Body() data: any) {
    return this.crmService.createCampaign(data);
  }

  @Get('branches/:branchId/segmentation')
  async getCustomerSegmentation(@Param('branchId') branchId: string) {
    return this.crmService.getCustomerSegmentation(branchId);
  }
}
