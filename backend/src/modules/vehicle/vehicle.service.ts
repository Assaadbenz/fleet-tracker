import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async createVehicle(tenantId: string, dto: CreateVehicleDto) {
    // Check uniqueness within the tenant
    const existingVin = await this.prisma.vehicle.findFirst({
      where: {
        tenantId,
        vin: dto.vin,
      },
    });

    if (existingVin) {
      throw new ConflictException(`Vehicle with VIN ${dto.vin} already exists in your fleet`);
    }

    const existingPlate = await this.prisma.vehicle.findFirst({
      where: {
        tenantId,
        plateNumber: dto.plateNumber,
      },
    });

    if (existingPlate) {
      throw new ConflictException(`Vehicle with plate ${dto.plateNumber} already exists in your fleet`);
    }

    return this.prisma.vehicle.create({
      data: {
        vin: dto.vin,
        plateNumber: dto.plateNumber,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        currentMileage: dto.currentMileage ?? 0,
        status: VehicleStatus.ACTIVE,
        tenantId,
      },
    });
  }

  async listVehicles(tenantId: string, status?: VehicleStatus) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        _count: {
          select: {
            maintenanceSchedules: true,
            workOrders: true,
            mileageLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVehicleById(tenantId: string, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        tenantId,
      },
      include: {
        maintenanceSchedules: true,
        workOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        mileageLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found in tenant organization`);
    }

    return vehicle;
  }

  async updateVehicle(tenantId: string, vehicleId: string, dto: UpdateVehicleDto) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found in tenant organization`);
    }

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        plateNumber: dto.plateNumber,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        status: dto.status,
      },
    });
  }

  async deleteVehicle(tenantId: string, vehicleId: string) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found in tenant organization`);
    }

    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return { success: true, message: `Vehicle ${vehicleId} deleted successfully` };
  }

  async exportVehiclesCsv(tenantId: string): Promise<string> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'VIN', 'Immatriculation', 'Marque', 'Modele', 'Annee', 'Kilometrage', 'Statut', 'DateCreation'];
    const rows = vehicles.map((v) => [
      v.id,
      `"${v.vin}"`,
      `"${v.plateNumber}"`,
      `"${v.make}"`,
      `"${v.model}"`,
      v.year,
      v.currentMileage,
      v.status,
      v.createdAt.toISOString(),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
