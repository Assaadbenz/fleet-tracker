import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole, VehicleStatus } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createVehicle(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehicleService.createVehicle(tenantId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async listVehicles(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: VehicleStatus,
  ) {
    return this.vehicleService.listVehicles(tenantId, status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async getVehicle(
    @CurrentTenant() tenantId: string,
    @Param('id') vehicleId: string,
  ) {
    return this.vehicleService.getVehicleById(tenantId, vehicleId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateVehicle(
    @CurrentTenant() tenantId: string,
    @Param('id') vehicleId: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehicleService.updateVehicle(tenantId, vehicleId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteVehicle(
    @CurrentTenant() tenantId: string,
    @Param('id') vehicleId: string,
  ) {
    return this.vehicleService.deleteVehicle(tenantId, vehicleId);
  }
}
