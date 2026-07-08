
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    const result = await this.prisma.user.create({ data });
    await this.prisma.auditLog.create({ data: { resource: 'User', resourceId: (result as any).id, action: 'CREATE', payload: data as any } });
    return result;
  }

  async findAll(query?: any) {
    const { page = 1, limit = 10, ...filters } = query || {};
    const where = { 
      ...filters,
      
    };
    return this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: +limit,
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.user.findUnique({ where: { id } });
    if (!result ) throw new NotFoundException();
    return result;
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const result = await this.prisma.user.update({ where: { id }, data });
    await this.prisma.auditLog.create({ data: { resource: 'User', resourceId: id, action: 'UPDATE', payload: data as any } });
    return result;
  }

  async remove(id: string) {
    
    const result = await this.prisma.user.delete({ where: { id } });
    
    await this.prisma.auditLog.create({ data: { resource: 'User', resourceId: id, action: 'DELETE' } });
    return result;
  }
}
      