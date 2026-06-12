import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getIngredients(branchId: string) {
    return this.prisma.ingredient.findMany({
      where: { branchId },
      include: { supplier: true },
      orderBy: { quantity: 'asc' }
    });
  }

  async updateIngredient(id: string, data: { quantity?: number; costPerUnit?: number; expiryDate?: string }) {
    const ingredient = await this.prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) throw new NotFoundException('Ingredient not found');

    return this.prisma.ingredient.update({
      where: { id },
      data: {
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.costPerUnit !== undefined ? { costPerUnit: data.costPerUnit } : {}),
        ...(data.expiryDate ? { expiryDate: new Date(data.expiryDate) } : {})
      }
    });
  }

  async logWaste(data: {
    branchId: string;
    ingredientId?: string;
    menuItemId?: string;
    quantity: number;
    reason: string;
  }) {
    let cost = 0;

    if (data.ingredientId) {
      const ing = await this.prisma.ingredient.findUnique({ where: { id: data.ingredientId } });
      if (!ing) throw new NotFoundException('Ingredient not found');
      cost = ing.costPerUnit * data.quantity;

      // Deduct from stock
      await this.prisma.ingredient.update({
        where: { id: data.ingredientId },
        data: { quantity: { decrement: data.quantity } }
      });
    } else if (data.menuItemId) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: data.menuItemId },
        include: { recipeItems: { include: { ingredient: true } } }
      });
      if (!menuItem) throw new NotFoundException('Menu item not found');

      // Calculate cost based on ingredients
      let itemCost = 0;
      for (const recipeItem of menuItem.recipeItems) {
        itemCost += recipeItem.quantity * recipeItem.ingredient.costPerUnit;
      }
      cost = itemCost * data.quantity;

      // In case of completed unsold menu items, ingredients were already deducted at POS,
      // but if we are logging waste of pre-prepared/raw item:
      // (Optionally deduct here, but usually POS handles finished items, so we just log the cost).
    }

    return this.prisma.wasteRecord.create({
      data: {
        branchId: data.branchId,
        ingredientId: data.ingredientId || null,
        menuItemId: data.menuItemId || null,
        quantity: data.quantity,
        cost,
        reason: data.reason
      }
    });
  }

  async getWasteRecords(branchId: string) {
    return this.prisma.wasteRecord.findMany({
      where: { branchId },
      include: {
        ingredient: true,
        menuItem: true
      },
      orderBy: { recordedAt: 'desc' }
    });
  }

  async getRecipeCosting(branchId: string) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { branchId },
      include: {
        recipeItems: {
          include: { ingredient: true }
        }
      }
    });

    return menuItems.map(item => {
      let ingredientCost = 0;
      const ingredientsList = item.recipeItems.map(ri => {
        const itemCost = ri.quantity * ri.ingredient.costPerUnit;
        ingredientCost += itemCost;
        return {
          name: ri.ingredient.name,
          qty: ri.quantity,
          unit: ri.ingredient.unit,
          cost: itemCost
        };
      });

      // packaging/production cost simulation
      const packagingCost = item.category === 'Coffee' ? 2.5 : 5.0; // Cups vs boxes
      const totalCost = ingredientCost + packagingCost;
      const profit = item.price - totalCost;
      const margin = item.price > 0 ? (profit / item.price) * 100 : 0;

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        ingredientCost,
        packagingCost,
        totalCost,
        profit,
        margin: Math.round(margin * 100) / 100,
        ingredients: ingredientsList
      };
    });
  }

  async getSuppliers() {
    return this.prisma.supplier.findMany({
      include: {
        ingredients: true
      }
    });
  }

  async createSupplier(data: {
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    paymentTerms?: string;
  }) {
    return this.prisma.supplier.create({ data });
  }
}
