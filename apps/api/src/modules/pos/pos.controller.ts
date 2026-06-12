import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pos')
@UseGuards(JwtAuthGuard)
export class PosController {
  constructor(private posService: PosService) {}

  @Get('branches/:branchId/tables')
  async getTables(@Param('branchId') branchId: string) {
    return this.posService.getTables(branchId);
  }

  @Patch('tables/:tableId/status')
  async updateTableStatus(
    @Param('tableId') tableId: string,
    @Body('status') status: string
  ) {
    return this.posService.updateTableStatus(tableId, status);
  }

  @Get('branches/:branchId/reservations')
  async getReservations(@Param('branchId') branchId: string) {
    return this.posService.getReservations(branchId);
  }

  @Post('reservations')
  async createReservation(@Body() data: any) {
    return this.posService.createReservation(data);
  }

  @Get('branches/:branchId/menu')
  async getMenu(@Param('branchId') branchId: string) {
    return this.posService.getMenu(branchId);
  }

  @Get('branches/:branchId/orders')
  async getOrders(
    @Param('branchId') branchId: string,
    @Query('status') status?: string
  ) {
    return this.posService.getOrders(branchId, status);
  }

  @Get('orders/:orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.posService.getOrder(orderId);
  }

  @Post('orders')
  async createOrder(@Body() data: any, @Req() req: any) {
    // Inject current user id from JWT
    const userId = req.user?.sub;
    return this.posService.createOrder({ ...data, userId });
  }

  @Patch('orders/:orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string
  ) {
    return this.posService.updateOrderStatus(orderId, status);
  }
}
