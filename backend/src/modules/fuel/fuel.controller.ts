import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateFuelLogDto } from './dto/create-fuel-log.dto';
import { FuelService } from './fuel.service';

@Controller('fuel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelController {
  constructor(private readonly fuelService: FuelService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  @HttpCode(HttpStatus.CREATED)
  async logFuel(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFuelLogDto,
  ) {
    return this.fuelService.createFuelLog(tenantId, user.userId, dto);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getSummary(@CurrentTenant() tenantId: string) {
    return this.fuelService.getTenantFuelSummary(tenantId);
  }

  @Get(':vehicleId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async getVehicleFuel(
    @CurrentTenant() tenantId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.fuelService.getFuelLogsByVehicle(tenantId, vehicleId);
  }
}
