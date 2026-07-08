
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.OrderCreateInput) {
    const result = await this.prisma.order.create({ data });
    await this.prisma.auditLog.create({ data: { resource: 'Order', resourceId: (result as any).id, action: 'CREATE', payload: data as any } });
    return result;
  }

  async findAll(query?: any) {
    const { page = 1, limit = 10, ...filters } = query || {};
    const where = { 
      ...filters,
      
    };
    return this.prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: +limit,
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.order.findUnique({ where: { id } });
    if (!result ) throw new NotFoundException();
    return result;
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    const result = await this.prisma.order.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { resource: 'Order', resourceId: id, action: 'UPDATE', payload: data as any } });
    return result;
  }

  async remove(id: string) {
    
    const result = await this.prisma.order.delete({ where: { id } });
    
    await this.prisma.auditLog.create({ data: { resource: 'Order', resourceId: id, action: 'DELETE' } });
    return result;
  }
}
      