import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';

@Injectable()
export class FuelService {
  constructor(private readonly prisma: PrismaService) {}

  async createFuelLog(tenantId: string, userId: string, dto: CreateFuelLogDto) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }

    if (dto.odometer < vehicle.currentMileage) {
      throw new BadRequestException(
        `Odometer (${dto.odometer} km) cannot be less than current vehicle mileage (${vehicle.currentMileage} km)`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create fuel log
      const fuelLog = await tx.fuelLog.create({
        data: {
          vehicleId: vehicle.id,
          recordedByUserId: userId,
          tenantId,
          liters: dto.liters,
          totalCost: dto.totalCost,
          odometer: dto.odometer,
          fuelType: dto.fuelType || 'DIESEL',
          fullTank: dto.fullTank ?? true,
          stationName: dto.stationName || null,
        },
      });

      // 2. Advance vehicle odometer if greater
      if (dto.odometer > vehicle.currentMileage) {
        await tx.vehicle.update({
          where: { id: vehicle.id },
          data: { currentMileage: dto.odometer },
        });

        // Also record a mileage log entry
        await tx.mileageLog.create({
          data: {
            vehicleId: vehicle.id,
            recordedByUserId: userId,
            tenantId,
            mileage: dto.odometer,
          },
        });
      }

      return fuelLog;
    });
  }

  async getFuelLogsByVehicle(tenantId: string, vehicleId: string) {
    const logs = await this.prisma.fuelLog.findMany({
      where: { tenantId, vehicleId },
      orderBy: { recordedAt: 'desc' },
      include: {
        recordedByUser: {
          select: { id: true, email: true, role: true },
        },
      },
    });

    return logs;
  }

  async getTenantFuelSummary(tenantId: string) {
    const logs = await this.prisma.fuelLog.findMany({
      where: { tenantId },
      orderBy: { odometer: 'asc' },
    });

    const totalLiters = logs.reduce((sum, l) => sum + Number(l.liters), 0);
    const totalCost = logs.reduce((sum, l) => sum + Number(l.totalCost), 0);
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

    return {
      totalRefills: logs.length,
      totalLiters: Math.round(totalLiters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      avgPricePerLiter: Math.round(avgPricePerLiter * 100) / 100,
    };
  }
}
