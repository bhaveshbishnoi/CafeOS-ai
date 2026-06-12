import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PosService {
  constructor(private prisma: PrismaService) {}

  async getTables(branchId: string) {
    return this.prisma.table.findMany({
      where: { branchId },
      include: { reservations: { orderBy: { dateTime: 'asc' } } }
    });
  }

  async updateTableStatus(tableId: string, status: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');
    return this.prisma.table.update({
      where: { id: tableId },
      data: { status }
    });
  }

  async getReservations(branchId: string) {
    return this.prisma.reservation.findMany({
      where: { branchId },
      include: { table: true },
      orderBy: { dateTime: 'asc' }
    });
  }

  async createReservation(data: {
    branchId: string;
    tableId: string;
    customerName: string;
    customerPhone: string;
    dateTime: string;
    partySize: number;
  }) {
    // Check table capacity
    const table = await this.prisma.table.findUnique({ where: { id: data.tableId } });
    if (!table) throw new NotFoundException('Table not found');
    if (table.capacity < data.partySize) {
      throw new BadRequestException(`Table capacity (${table.capacity}) is lower than party size (${data.partySize})`);
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        branchId: data.branchId,
        tableId: data.tableId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        dateTime: new Date(data.dateTime),
        partySize: data.partySize
      }
    });

    // Mark table as reserved
    await this.prisma.table.update({
      where: { id: data.tableId },
      data: { status: 'RESERVED' }
    });

    return reservation;
  }

  async getMenu(branchId: string) {
    return this.prisma.menuItem.findMany({
      where: { branchId },
      include: {
        recipeItems: {
          include: { ingredient: true }
        }
      }
    });
  }

  async getOrders(branchId: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        branchId,
        ...(status ? { status } : {})
      },
      include: {
        items: { include: { menuItem: true } },
        splitPayments: true,
        customer: true,
        table: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrder(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { menuItem: true } },
        splitPayments: true,
        customer: true,
        table: true
      }
    });
  }

  async createOrder(data: {
    branchId: string;
    type: string;
    paymentMethod: string;
    tableId?: string;
    customerId?: string;
    userId?: string;
    discount?: number;
    items: { menuItemId: string; quantity: number }[];
    splitPayments?: { method: string; amount: number }[];
  }) {
    // 1. Calculate values
    let subtotal = 0;
    const itemsToCreate = [];
    const lowStockAlerts: string[] = [];

    // Check ingredients and calculate subtotal
    for (const item of data.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { recipeItems: { include: { ingredient: true } } }
      });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);

      subtotal += menuItem.price * item.quantity;
      itemsToCreate.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        price: menuItem.price
      });

      // Deduct ingredients from recipe
      for (const recipeItem of menuItem.recipeItems) {
        const requiredQty = recipeItem.quantity * item.quantity;
        const currentIng = recipeItem.ingredient;

        if (currentIng.quantity < requiredQty) {
          // If we want a strict POS blocking we can throw an error, but let's allow ordering and flag negative stock or log an warning.
          // In cafes, it's safer to deduct and warn so operations don't freeze due to slow inventory entries.
          lowStockAlerts.push(`Critical: Insufficient ${currentIng.name} stock (Needs ${requiredQty}${currentIng.unit}, has ${currentIng.quantity}${currentIng.unit})`);
        }

        const updatedIng = await this.prisma.ingredient.update({
          where: { id: currentIng.id },
          data: { quantity: { decrement: requiredQty } }
        });

        if (updatedIng.quantity <= updatedIng.minStockAlert) {
          lowStockAlerts.push(`Warning: Low stock for ${updatedIng.name} (${updatedIng.quantity} ${updatedIng.unit} left)`);
          
          // Log an audit record
          await this.prisma.auditLog.create({
            data: {
              userId: data.userId || null,
              action: 'INVENTORY_LOW_ALERT',
              details: JSON.stringify({ ingredientId: updatedIng.id, name: updatedIng.name, quantity: updatedIng.quantity }),
              branchId: data.branchId
            }
          });
        }
      }
    }

    const discount = data.discount || 0;
    const tax = Math.max(0, Math.round((subtotal - discount) * 0.05 * 100) / 100);
    const total = Math.max(0, subtotal - discount + tax);

    // Generate Order Number
    const orderNumber = `FC-${data.branchId.substring(0, 4).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. Loyalty Accrual
    if (data.customerId) {
      const customer = await this.prisma.customer.findUnique({ where: { id: data.customerId } });
      if (customer) {
        const pointsAdded = Math.floor(total / 100);
        const cashbackAdded = total * 0.02;

        await this.prisma.customer.update({
          where: { id: data.customerId },
          data: {
            visitCount: { increment: 1 },
            totalSpend: { increment: total },
            points: { increment: pointsAdded },
            cashback: { increment: cashbackAdded },
            lastVisit: new Date()
          }
        });

        await this.prisma.loyaltyTransaction.create({
          data: {
            customerId: data.customerId,
            pointsDelta: pointsAdded,
            cashbackDelta: cashbackAdded,
            description: `Accrued from Order ${orderNumber}`
          }
        });
      }
    }

    // 3. Create Order
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        type: data.type,
        status: data.type === 'QR_ORDER' ? 'PENDING' : 'PREPARING', // Dine-in/takeaway starts preparing immediately
        paymentStatus: data.paymentMethod === 'CASH' || data.paymentMethod === 'UPI' || data.paymentMethod === 'CARD' || data.paymentMethod === 'WALLET' ? 'PAID' : 'PENDING',
        paymentMethod: data.paymentMethod,
        subtotal,
        discount,
        tax,
        total,
        branchId: data.branchId,
        tableId: data.tableId || null,
        userId: data.userId || null,
        customerId: data.customerId || null,
        items: {
          create: itemsToCreate
        }
      },
      include: {
        items: { include: { menuItem: true } },
        customer: true,
        table: true
      }
    });

    // Handle Split Payments
    if (data.paymentMethod === 'SPLIT' && data.splitPayments) {
      for (const split of data.splitPayments) {
        await this.prisma.splitPayment.create({
          data: {
            orderId: order.id,
            method: split.method,
            amount: split.amount
          }
        });
      }
      // If sum of split payments matches order total, set paymentStatus to PAID
      const splitSum = data.splitPayments.reduce((acc, curr) => acc + curr.amount, 0);
      if (splitSum >= total) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID' }
        });
      }
    }

    // Update Table status if table is selected
    if (data.tableId && data.type === 'DINE_IN') {
      await this.prisma.table.update({
        where: { id: data.tableId },
        data: { status: 'OCCUPIED' }
      });
    }

    return {
      order,
      lowStockAlerts
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { table: true }
    });
    if (!order) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    // If order is completed or cancelled, handle table status
    if (order.tableId) {
      if (status === 'COMPLETED') {
        await this.prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'CLEANING' }
        });
      } else if (status === 'CANCELLED') {
        await this.prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' }
        });
      }
    }

    return updatedOrder;
  }
}
