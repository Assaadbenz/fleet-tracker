import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            vehicles: true,
            users: true,
            workOrders: true,
            maintenanceSchedules: true,
            mileageLogs: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    // Verified tenant existence scoped to current tenant
    const existing = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { name: dto.name },
    });
  }

  async getTenantUsers(tenantId: string) {
    // Strictly scoped query by tenantId
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTenantUser(tenantId: string, dto: CreateTenantUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    // Creates user guaranteed with current tenantId
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  async deleteTenantUser(tenantId: string, targetUserId: string, requestingUserId: string) {
    if (targetUserId === requestingUserId) {
      throw new BadRequestException('You cannot delete your own user account');
    }

    // Must exist within the current tenant's scope
    const user = await this.prisma.user.findFirst({
      where: {
        id: targetUserId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found within this tenant organization');
    }

    await this.prisma.user.delete({
      where: { id: targetUserId },
    });

    return { success: true, message: 'User removed successfully from tenant organization' };
  }
}
