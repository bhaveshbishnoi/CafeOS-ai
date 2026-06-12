import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('branches/:branchId/ingredients')
  async getIngredients(@Param('branchId') branchId: string) {
    return this.inventoryService.getIngredients(branchId);
  }

  @Patch('ingredients/:id')
  async updateIngredient(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.inventoryService.updateIngredient(id, data);
  }

  @Post('waste')
  async logWaste(@Body() data: any) {
    return this.inventoryService.logWaste(data);
  }

  @Get('branches/:branchId/waste')
  async getWasteRecords(@Param('branchId') branchId: string) {
    return this.inventoryService.getWasteRecords(branchId);
  }

  @Get('branches/:branchId/recipes/costing')
  async getRecipeCosting(@Param('branchId') branchId: string) {
    return this.inventoryService.getRecipeCosting(branchId);
  }

  @Get('suppliers')
  async getSuppliers() {
    return this.inventoryService.getSuppliers();
  }

  @Post('suppliers')
  async createSupplier(@Body() data: any) {
    return this.inventoryService.createSupplier(data);
  }
}
