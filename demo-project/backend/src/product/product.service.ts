
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput) {
    const result = await this.prisma.product.create({ data });
    await this.prisma.auditLog.create({ data: { resource: 'Product', resourceId: (result as any).id, action: 'CREATE', payload: data as any } });
    return result;
  }

  async findAll(query?: any) {
    const { page = 1, limit = 10, ...filters } = query || {};
    const where = { 
      ...filters,
      deletedAt: null
    };
    return this.prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: +limit,
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.product.findUnique({ where: { id } });
    if (!result || (result as any).deletedAt) throw new NotFoundException();
    return result;
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    const result = await this.prisma.product.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { resource: 'Product', resourceId: id, action: 'UPDATE', payload: data as any } });
    return result;
  }

  async remove(id: string) {
    
    const result = await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
    
    await this.prisma.auditLog.create({ data: { resource: 'Product', resourceId: id, action: 'DELETE' } });
    return result;
  }
}
      