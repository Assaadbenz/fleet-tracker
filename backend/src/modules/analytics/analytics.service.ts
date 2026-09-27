import { Injectable } from '@nestjs/common';
import { VehicleStatus, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    const [vehicles, workOrders, fuelLogs] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        include: {
          maintenanceSchedules: true,
        },
      }),
      this.prisma.workOrder.findMany({
        where: { tenantId },
      }),
      this.prisma.fuelLog.findMany({
        where: { tenantId },
      }),
    ]);

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(
      (v) => v.status === VehicleStatus.ACTIVE,
    ).length;
    const maintenanceVehicles = vehicles.filter(
      (v) => v.status === VehicleStatus.MAINTENANCE,
    ).length;
    const inactiveVehicles = vehicles.filter(
      (v) => v.status === VehicleStatus.INACTIVE,
    ).length;

    const totalMileage = vehicles.reduce((sum, v) => sum + v.currentMileage, 0);
    const avgMileage = totalVehicles > 0 ? Math.round(totalMileage / totalVehicles) : 0;

    const totalMaintenanceCost = workOrders.reduce(
      (sum, wo) => sum + Number(wo.cost),
      0,
    );
    const totalFuelCost = fuelLogs.reduce(
      (sum, fl) => sum + Number(fl.totalCost),
      0,
    );
    const totalFuelLiters = fuelLogs.reduce(
      (sum, fl) => sum + Number(fl.liters),
      0,
    );

    const costPerKm =
      totalMileage > 0
        ? Math.round(((totalMaintenanceCost + totalFuelCost) / totalMileage) * 1000) / 1000
        : 0;

    const availabilityRate =
      totalVehicles > 0
        ? Math.round((activeVehicles / totalVehicles) * 1000) / 10
        : 100;

    return {
      fleet: {
        total: totalVehicles,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        inactive: inactiveVehicles,
        availabilityRate: `${availabilityRate}%`,
        totalMileageKm: totalMileage,
        avgMileageKm: avgMileage,
      },
      financials: {
        totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
        totalFuelCost: Math.round(totalFuelCost * 100) / 100,
        totalOperationalCost:
          Math.round((totalMaintenanceCost + totalFuelCost) * 100) / 100,
        costPerKmMad: costPerKm,
      },
      fuel: {
        totalLiters: Math.round(totalFuelLiters * 100) / 100,
        totalCost: Math.round(totalFuelCost * 100) / 100,
      },
      workOrders: {
        total: workOrders.length,
        completed: workOrders.filter((wo) => wo.status === WorkOrderStatus.COMPLETED).length,
        inProgress: workOrders.filter((wo) => wo.status === WorkOrderStatus.IN_PROGRESS).length,
        pending: workOrders.filter((wo) => wo.status === WorkOrderStatus.PENDING).length,
      },
    };
  }

  async getCostBreakdown(tenantId: string) {
    const workOrders = await this.prisma.workOrder.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });

    // Group costs by title keyword / category
    const categories: Record<string, number> = {
      Freinage: 0,
      Vidange: 0,
      Pneumatiques: 0,
      Transmission: 0,
      Autre: 0,
    };

    for (const wo of workOrders) {
      const titleLower = wo.title.toLowerCase();
      const cost = Number(wo.cost);

      if (titleLower.includes('frein')) {
        categories.Freinage += cost;
      } else if (titleLower.includes('vidange') || titleLower.includes('filtre')) {
        categories.Vidange += cost;
      } else if (titleLower.includes('pneu') || titleLower.includes('roue')) {
        categories.Pneumatiques += cost;
      } else if (titleLower.includes('transmission') || titleLower.includes('boite')) {
        categories.Transmission += cost;
      } else {
        categories.Autre += cost;
      }
    }

    return {
      categories: Object.entries(categories).map(([label, amount]) => ({
        label,
        amount: Math.round(amount * 100) / 100,
      })),
    };
  }
}
