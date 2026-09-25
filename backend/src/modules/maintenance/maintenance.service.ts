import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VehicleStatus, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMaintenanceScheduleDto } from './dto/create-maintenance-schedule.dto';
import { SubmitMileageLogDto } from './dto/submit-mileage-log.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Submits a new mileage log, updates current mileage, and recalculates maintenance schedules.
   * If any schedule is due, automatically sets vehicle to MAINTENANCE and creates a PENDING WorkOrder.
   */
  async submitMileageLog(tenantId: string, userId: string, dto: SubmitMileageLogDto) {
    // Ensure vehicle exists and belongs strictly to the tenant
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: dto.vehicleId,
        tenantId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found in tenant organization`);
    }

    if (dto.mileage < vehicle.currentMileage) {
      throw new BadRequestException(
        `Submitted mileage (${dto.mileage} km) cannot be less than vehicle's current recorded mileage (${vehicle.currentMileage} km)`,
      );
    }

    const recordedAt = dto.recordedAt ?? new Date();

    return this.prisma.$transaction(async (tx) => {
      // 1. Record Mileage Log
      const mileageLog = await tx.mileageLog.create({
        data: {
          vehicleId: vehicle.id,
          recordedByUserId: userId,
          mileage: dto.mileage,
          recordedAt,
          tenantId,
        },
      });

      // 2. Update Vehicle Current Mileage
      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { currentMileage: dto.mileage },
      });

      // 3. Recalculate all maintenance schedules for this vehicle
      const schedules = await tx.maintenanceSchedule.findMany({
        where: {
          vehicleId: vehicle.id,
          tenantId,
        },
      });

      const triggeredWorkOrders = [];

      for (const schedule of schedules) {
        // Recalculate nextDueMileage
        let nextDueMileage = schedule.nextDueMileage;
        if (schedule.intervalKm) {
          if (schedule.lastServiceMileage !== null && schedule.lastServiceMileage !== undefined) {
            nextDueMileage = schedule.lastServiceMileage + schedule.intervalKm;
          } else if (!nextDueMileage) {
            nextDueMileage = vehicle.currentMileage + schedule.intervalKm;
          }
        }

        // Recalculate nextDueDate
        let nextDueDate = schedule.nextDueDate;
        if (schedule.intervalMonths) {
          const baseDate = schedule.lastServiceDate ?? schedule.createdAt;
          const calculatedDate = new Date(baseDate);
          calculatedDate.setMonth(calculatedDate.getMonth() + schedule.intervalMonths);
          nextDueDate = calculatedDate;
        }

        // Update schedule with newly calculated thresholds
        await tx.maintenanceSchedule.update({
          where: { id: schedule.id },
          data: {
            nextDueMileage,
            nextDueDate,
          },
        });

        // Check if schedule is now due
        const isMileageDue = nextDueMileage !== null && dto.mileage >= nextDueMileage;
        const isDateDue = nextDueDate !== null && nextDueDate <= new Date();

        if (isMileageDue || isDateDue) {
          // Check if an open WorkOrder already exists for this vehicle & service
          const existingOpenOrder = await tx.workOrder.findFirst({
            where: {
              tenantId,
              vehicleId: vehicle.id,
              title: { contains: schedule.serviceName },
              status: { in: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS] },
            },
          });

          if (!existingOpenOrder) {
            // Transition vehicle status to MAINTENANCE
            await tx.vehicle.update({
              where: { id: vehicle.id },
              data: { status: VehicleStatus.MAINTENANCE },
            });

            // Create PENDING WorkOrder
            const workOrder = await tx.workOrder.create({
              data: {
                tenantId,
                vehicleId: vehicle.id,
                title: `Scheduled Maintenance: ${schedule.serviceName}`,
                description:
                  `Automated trigger from mileage log update. ` +
                  `Recorded Mileage: ${dto.mileage} km. ` +
                  `Due Threshold: ${nextDueMileage ?? 'N/A'} km / ${nextDueDate ? nextDueDate.toISOString() : 'N/A'}.`,
                status: WorkOrderStatus.PENDING,
                cost: 0,
              },
            });

            triggeredWorkOrders.push(workOrder);

            // Dispatch notification
            await this.notificationsService.sendMaintenanceAlert({
              tenantId,
              vehicleId: vehicle.id,
              plateNumber: vehicle.plateNumber,
              serviceName: schedule.serviceName,
              triggerReason: isMileageDue ? 'MILEAGE_EXCEEDED' : 'DATE_OVERDUE',
              currentMileage: dto.mileage,
              dueMileage: nextDueMileage,
              dueDate: nextDueDate,
              workOrderId: workOrder.id,
            });
          }
        }
      }

      await this.notificationsService.sendMileageLoggedNotification({
        tenantId,
        vehicleId: vehicle.id,
        plateNumber: vehicle.plateNumber,
        newMileage: dto.mileage,
        recordedByUserId: userId,
        recordedAt,
      });

      return {
        mileageLog,
        vehicle: updatedVehicle,
        schedulesUpdated: schedules.length,
        triggeredWorkOrders,
      };
    });
  }

  /**
   * Creates a maintenance schedule for a vehicle with automatic calculation of initial due metrics.
   */
  async createSchedule(tenantId: string, dto: CreateMaintenanceScheduleDto) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: dto.vehicleId,
        tenantId,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found in tenant organization`);
    }

    const lastServiceMileage = dto.lastServiceMileage ?? vehicle.currentMileage;
    const lastServiceDate = dto.lastServiceDate ?? new Date();

    let nextDueMileage: number | null = null;
    if (dto.intervalKm) {
      nextDueMileage = lastServiceMileage + dto.intervalKm;
    }

    let nextDueDate: Date | null = null;
    if (dto.intervalMonths) {
      const calculated = new Date(lastServiceDate);
      calculated.setMonth(calculated.getMonth() + dto.intervalMonths);
      nextDueDate = calculated;
    }

    return this.prisma.maintenanceSchedule.create({
      data: {
        tenantId,
        vehicleId: dto.vehicleId,
        serviceName: dto.serviceName,
        intervalKm: dto.intervalKm,
        intervalMonths: dto.intervalMonths,
        lastServiceMileage,
        lastServiceDate,
        nextDueMileage,
        nextDueDate,
      },
    });
  }

  /**
   * BullMQ worker daily task:
   * Scans all MaintenanceSchedule records across all tenants where:
   * nextDueMileage <= vehicle.currentMileage OR nextDueDate <= now()
   * Automatically transitions vehicle status to MAINTENANCE and creates a PENDING WorkOrder.
   */
  async scanDueMaintenanceSchedules(): Promise<{ processed: number; workOrdersCreated: number }> {
    const now = new Date();
    this.logger.log(`[BullMQ Worker] Starting daily maintenance scan at ${now.toISOString()}...`);

    // Fetch schedules with their associated vehicle
    const schedules = await this.prisma.maintenanceSchedule.findMany({
      include: {
        vehicle: true,
      },
    });

    let processedCount = 0;
    let createdCount = 0;

    for (const schedule of schedules) {
      processedCount++;
      const vehicle = schedule.vehicle;

      const isMileageDue =
        schedule.nextDueMileage !== null && vehicle.currentMileage >= schedule.nextDueMileage;
      const isDateDue = schedule.nextDueDate !== null && schedule.nextDueDate <= now;

      if (isMileageDue || isDateDue) {
        // Enforce tenant isolation when inspecting existing active work orders
        const existingOrder = await this.prisma.workOrder.findFirst({
          where: {
            tenantId: schedule.tenantId,
            vehicleId: schedule.vehicleId,
            title: { contains: schedule.serviceName },
            status: { in: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS] },
          },
        });

        if (!existingOrder) {
          await this.prisma.$transaction(async (tx) => {
            // Transition vehicle to MAINTENANCE
            await tx.vehicle.update({
              where: { id: vehicle.id },
              data: { status: VehicleStatus.MAINTENANCE },
            });

            // Create PENDING WorkOrder
            const workOrder = await tx.workOrder.create({
              data: {
                tenantId: schedule.tenantId,
                vehicleId: vehicle.id,
                title: `Scheduled Maintenance: ${schedule.serviceName}`,
                description:
                  `Daily cron scan triggered work order. ` +
                  `Vehicle Current Mileage: ${vehicle.currentMileage} km (Due at: ${schedule.nextDueMileage ?? 'N/A'} km). ` +
                  `Next Due Date: ${schedule.nextDueDate ? schedule.nextDueDate.toISOString() : 'N/A'}.`,
                status: WorkOrderStatus.PENDING,
                cost: 0,
              },
            });

            createdCount++;

            // Dispatch alert
            await this.notificationsService.sendMaintenanceAlert({
              tenantId: schedule.tenantId,
              vehicleId: vehicle.id,
              plateNumber: vehicle.plateNumber,
              serviceName: schedule.serviceName,
              triggerReason: isMileageDue ? 'MILEAGE_EXCEEDED' : 'DATE_OVERDUE',
              currentMileage: vehicle.currentMileage,
              dueMileage: schedule.nextDueMileage,
              dueDate: schedule.nextDueDate,
              workOrderId: workOrder.id,
            });
          });
        }
      }
    }

    this.logger.log(
      `[BullMQ Worker] Daily maintenance scan finished: Scanned ${processedCount} schedules, generated ${createdCount} work orders.`,
    );

    return { processed: processedCount, workOrdersCreated: createdCount };
  }

  async getSchedulesByVehicle(tenantId: string, vehicleId: string) {
    return this.prisma.maintenanceSchedule.findMany({
      where: {
        vehicleId,
        tenantId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMileageLogsByVehicle(tenantId: string, vehicleId: string) {
    return this.prisma.mileageLog.findMany({
      where: {
        vehicleId,
        tenantId,
      },
      include: {
        recordedByUser: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getWorkOrders(tenantId: string, status?: WorkOrderStatus) {
    return this.prisma.workOrder.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {}),
      },
      include: {
        vehicle: {
          select: { id: true, vin: true, plateNumber: true, make: true, model: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWorkOrder(tenantId: string, workOrderId: string, dto: UpdateWorkOrderDto) {
    const existingOrder = await this.prisma.workOrder.findFirst({
      where: {
        id: workOrderId,
        tenantId,
      },
      include: {
        vehicle: true,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException(`WorkOrder ${workOrderId} not found in tenant organization`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.workOrder.update({
        where: { id: workOrderId },
        data: {
          status: dto.status,
          cost: dto.cost,
          performedAt: dto.performedAt,
        },
      });

      // If work order marked COMPLETED, advance maintenance schedules and check vehicle status
      if (dto.status === WorkOrderStatus.COMPLETED) {
        const completedDate = dto.performedAt ?? new Date();
        const serviceMileage = existingOrder.vehicle.currentMileage;

        // Find and advance any matching schedule for this vehicle
        const matchingSchedules = await tx.maintenanceSchedule.findMany({
          where: {
            tenantId,
            vehicleId: existingOrder.vehicleId,
          },
        });

        for (const schedule of matchingSchedules) {
          if (existingOrder.title.toLowerCase().includes(schedule.serviceName.toLowerCase())) {
            let nextDueMileage = null;
            if (schedule.intervalKm) {
              nextDueMileage = serviceMileage + schedule.intervalKm;
            }

            let nextDueDate = null;
            if (schedule.intervalMonths) {
              const nextDate = new Date(completedDate);
              nextDate.setMonth(nextDate.getMonth() + schedule.intervalMonths);
              nextDueDate = nextDate;
            }

            await tx.maintenanceSchedule.update({
              where: { id: schedule.id },
              data: {
                lastServiceMileage: serviceMileage,
                lastServiceDate: completedDate,
                nextDueMileage,
                nextDueDate,
              },
            });
          }
        }

        const remainingActive = await tx.workOrder.count({
          where: {
            tenantId,
            vehicleId: existingOrder.vehicleId,
            status: { in: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS] },
            id: { not: workOrderId },
          },
        });

        // If no active work orders remain, restore vehicle status to ACTIVE
        if (remainingActive === 0) {
          await tx.vehicle.update({
            where: { id: existingOrder.vehicleId },
            data: { status: VehicleStatus.ACTIVE },
          });
        }
      }

      return updatedOrder;
    });
  }
}
