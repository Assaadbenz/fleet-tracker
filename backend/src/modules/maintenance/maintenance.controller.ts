import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UserRole, WorkOrderStatus } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { DAILY_MAINTENANCE_JOB, MAINTENANCE_QUEUE } from './constants/maintenance.constants';
import { CreateMaintenanceScheduleDto } from './dto/create-maintenance-schedule.dto';
import { SubmitMileageLogDto } from './dto/submit-mileage-log.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(
    private readonly maintenanceService: MaintenanceService,
    @InjectQueue(MAINTENANCE_QUEUE) private readonly maintenanceQueue: Queue,
  ) {}

  @Post('mileage')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  @HttpCode(HttpStatus.CREATED)
  async submitMileage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitMileageLogDto,
  ) {
    return this.maintenanceService.submitMileageLog(tenantId, user.userId, dto);
  }

  @Get('mileage/:vehicleId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async getMileageLogs(
    @CurrentTenant() tenantId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.maintenanceService.getMileageLogsByVehicle(tenantId, vehicleId);
  }

  @Post('schedules')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMaintenanceScheduleDto,
  ) {
    return this.maintenanceService.createSchedule(tenantId, dto);
  }

  @Get('schedules/:vehicleId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async getSchedules(
    @CurrentTenant() tenantId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.maintenanceService.getSchedulesByVehicle(tenantId, vehicleId);
  }

  @Get('work-orders')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async getWorkOrders(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: WorkOrderStatus,
  ) {
    return this.maintenanceService.getWorkOrders(tenantId, status);
  }

  @Patch('work-orders/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateWorkOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') workOrderId: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.maintenanceService.updateWorkOrder(tenantId, workOrderId, dto);
  }

  @Post('trigger-scan')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerManualScan() {
    const job = await this.maintenanceQueue.add(
      DAILY_MAINTENANCE_JOB,
      { triggeredManually: true, timestamp: new Date().toISOString() },
      { removeOnComplete: true },
    );
    return {
      message: 'Maintenance scan job queued successfully in BullMQ',
      jobId: job.id,
    };
  }
}
