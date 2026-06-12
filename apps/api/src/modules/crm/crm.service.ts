import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async getCustomers(branchId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { branchId },
      orderBy: { totalSpend: 'desc' }
    });

    return customers.map(cust => ({
      ...cust,
      segment: this.determineSegment(cust)
    }));
  }

  async getCustomer(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
        orders: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return {
      ...customer,
      segment: this.determineSegment(customer)
    };
  }

  async createCustomer(data: {
    branchId: string;
    name: string;
    phone: string;
    email?: string;
  }) {
    return this.prisma.customer.create({
      data: {
        branchId: data.branchId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        points: 0,
        cashback: 0.0,
        membershipTier: 'SILVER',
        visitCount: 0,
        totalSpend: 0.0
      }
    });
  }

  async getCampaigns(branchId: string) {
    return this.prisma.campaign.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCampaign(data: {
    branchId: string;
    name: string;
    channel: string;
    content: string;
    triggerEvent?: string;
    status?: string;
  }) {
    return this.prisma.campaign.create({
      data: {
        branchId: data.branchId,
        name: data.name,
        channel: data.channel,
        content: data.content,
        triggerEvent: data.triggerEvent || null,
        status: data.status || 'DRAFT'
      }
    });
  }

  async getCustomerSegmentation(branchId: string) {
    const customers = await this.prisma.customer.findMany({ where: { branchId } });
    
    const segments: Record<string, any[]> = {
      VIP: [],
      Regular: [],
      New: [],
      AtRisk: [],
      Inactive: []
    };

    for (const cust of customers) {
      const seg = this.determineSegment(cust);
      if (seg === 'VIP') segments.VIP.push(cust);
      else if (seg === 'Regular') segments.Regular.push(cust);
      else if (seg === 'New') segments.New.push(cust);
      else if (seg === 'At Risk') segments.AtRisk.push(cust);
      else segments.Inactive.push(cust);
    }

    return {
      counts: {
        VIP: segments.VIP.length,
        Regular: segments.Regular.length,
        New: segments.New.length,
        AtRisk: segments.AtRisk.length,
        Inactive: segments.Inactive.length,
        total: customers.length
      },
      segments
    };
  }

  private determineSegment(customer: any): string {
    const now = new Date();
    const lastVisit = customer.lastVisit ? new Date(customer.lastVisit) : null;
    const diffDays = lastVisit ? Math.ceil((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)) : 999;

    // Rules
    if (customer.totalSpend >= 10000 || customer.visitCount >= 20) {
      return 'VIP';
    }
    if (diffDays > 60) {
      return 'Inactive';
    }
    if (diffDays > 30 && customer.visitCount >= 3) {
      return 'At Risk';
    }
    if (customer.visitCount <= 2) {
      return 'New';
    }
    return 'Regular';
  }
}
