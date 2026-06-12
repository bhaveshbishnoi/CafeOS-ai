import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(branchId: string) {
    const orders = await this.prisma.order.findMany({
      where: { branchId, status: 'COMPLETED' },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                recipeItems: {
                  include: { ingredient: true }
                }
              }
            }
          }
        }
      }
    });

    const expenses = await this.prisma.expense.findMany({
      where: { branchId }
    });

    const waste = await this.prisma.wasteRecord.findMany({
      where: { branchId }
    });

    // 1. Calculate Core Financials
    let totalRevenue = 0;
    let totalCOGS = 0;

    for (const order of orders) {
      totalRevenue += order.total;
      for (const item of order.items) {
        let singleItemCost = 0;
        for (const recipeItem of item.menuItem.recipeItems) {
          singleItemCost += recipeItem.quantity * recipeItem.ingredient.costPerUnit;
        }
        // packaging cost simulation
        const packaging = item.menuItem.category === 'Coffee' ? 2.5 : 5.0;
        totalCOGS += (singleItemCost + packaging) * item.quantity;
      }
    }

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalWasteCost = waste.reduce((acc, curr) => acc + curr.cost, 0);

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = totalRevenue - totalCOGS - totalExpenses - totalWasteCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // 2. Sales Trend (Last 30 Days)
    const salesTrend = await this.getSalesTrend(branchId);

    // 3. Category Sales Breakdown
    const categoryBreakdown: Record<string, number> = {};
    const productSalesMap: Record<string, any> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.menuItem.category;
        const name = item.menuItem.name;

        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + item.price * item.quantity;
        
        if (!productSalesMap[name]) {
          productSalesMap[name] = { name, quantity: 0, revenue: 0 };
        }
        productSalesMap[name].quantity += item.quantity;
        productSalesMap[name].revenue += item.price * item.quantity;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // 4. Waste Breakdown
    const wasteBreakdown: Record<string, number> = { EXPIRED: 0, SPOILED: 0, DAMAGED: 0, UNSOLD: 0 };
    for (const w of waste) {
      wasteBreakdown[w.reason] = (wasteBreakdown[w.reason] || 0) + w.cost;
    }

    return {
      financials: {
        totalRevenue: Math.round(totalRevenue),
        totalCOGS: Math.round(totalCOGS),
        totalExpenses: Math.round(totalExpenses),
        totalWasteCost: Math.round(totalWasteCost),
        grossProfit: Math.round(grossProfit),
        netProfit: Math.round(netProfit),
        grossMargin: Math.round(grossMargin * 100) / 100,
        netMargin: Math.round(netMargin * 100) / 100
      },
      salesTrend,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value })),
      topProducts,
      wasteBreakdown: Object.entries(wasteBreakdown).map(([name, value]) => ({ name, value }))
    };
  }

  async getMultiBranchLeaderboard() {
    const branches = await this.prisma.branch.findMany();
    const leaderboard = [];

    for (const b of branches) {
      const orders = await this.prisma.order.findMany({
        where: { branchId: b.id, status: 'COMPLETED' },
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  recipeItems: { include: { ingredient: true } }
                }
              }
            }
          }
        }
      });

      const waste = await this.prisma.wasteRecord.findMany({ where: { branchId: b.id } });
      const expenses = await this.prisma.expense.findMany({ where: { branchId: b.id } });

      let revenue = 0;
      let cogs = 0;
      for (const order of orders) {
        revenue += order.total;
        for (const item of order.items) {
          let singleCost = 0;
          for (const ri of item.menuItem.recipeItems) {
            singleCost += ri.quantity * ri.ingredient.costPerUnit;
          }
          const packaging = item.menuItem.category === 'Coffee' ? 2.5 : 5.0;
          cogs += (singleCost + packaging) * item.quantity;
        }
      }

      const wasteCost = waste.reduce((acc, curr) => acc + curr.cost, 0);
      const expenseCost = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const profit = revenue - cogs - expenseCost - wasteCost;

      // Simulated satisfaction ratings based on branch name to add variety
      const satisfaction = b.name.includes('HSR') ? 4.8 : 4.5;

      leaderboard.push({
        id: b.id,
        name: b.name,
        revenue: Math.round(revenue),
        waste: Math.round(wasteCost),
        profit: Math.round(profit),
        satisfaction
      });
    }

    return leaderboard.sort((a, b) => b.revenue - a.revenue);
  }

  async getStaffMetrics(branchId: string) {
    const users = await this.prisma.user.findMany({
      where: { branchId, role: { in: ['CASHIER', 'KITCHEN_STAFF'] } },
      include: {
        orders: { where: { status: 'COMPLETED' } },
        attendance: true
      }
    });

    return users.map(user => {
      const totalOrders = user.orders.length;
      const totalRevenue = user.orders.reduce((acc, curr) => acc + curr.total, 0);
      
      // Calculate delay in check-in
      let totalDelayMins = 0;
      let presentDays = 0;
      for (const att of user.attendance) {
        if (att.checkIn) {
          presentDays++;
          // Shift start simulated at 9AM for HSR and 11AM for Indira in seed
          const shiftHour = branchId.substring(0, 4) === 'hsr' ? 9 : 11;
          const shiftStart = new Date(att.date);
          shiftStart.setHours(shiftHour, 0, 0);
          
          const checkInTime = new Date(att.checkIn);
          const delay = Math.max(0, Math.floor((checkInTime.getTime() - shiftStart.getTime()) / (1000 * 60)));
          totalDelayMins += delay;
        }
      }

      const avgDelay = presentDays > 0 ? Math.round(totalDelayMins / presentDays) : 0;
      // performance rating out of 100
      let rating = 90;
      if (avgDelay > 10) rating -= (avgDelay - 10) * 1.5;
      if (user.role === 'CASHIER') {
        rating += Math.min(10, totalOrders / 20); // speed points
      }
      rating = Math.max(50, Math.min(100, Math.round(rating)));

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        ordersProcessed: totalOrders,
        salesGenerated: Math.round(totalRevenue),
        avgDelayMinutes: avgDelay,
        performanceScore: rating
      };
    });
  }

  async getExpenses(branchId: string) {
    return this.prisma.expense.findMany({
      where: { branchId },
      orderBy: { date: 'desc' }
    });
  }

  async createExpense(branchId: string, data: { category: string; amount: number; description?: string; date: string }) {
    return this.prisma.expense.create({
      data: {
        branchId,
        category: data.category,
        amount: data.amount,
        description: data.description || null,
        date: new Date(data.date)
      }
    });
  }

  private async getSalesTrend(branchId: string) {
    const now = new Date();
    const trend = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const orders = await this.prisma.order.findMany({
        where: {
          branchId,
          status: 'COMPLETED',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      const total = orders.reduce((acc, curr) => acc + curr.total, 0);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      trend.push({
        date: dateString,
        revenue: Math.round(total)
      });
    }

    return trend;
  }
}
