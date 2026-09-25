import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantService } from './tenant.service';

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('current')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DRIVER)
  async getCurrentTenant(@CurrentTenant() tenantId: string) {
    return this.tenantService.getTenantProfile(tenantId);
  }

  @Patch('current')
  @Roles(UserRole.ADMIN)
  async updateCurrentTenant(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantService.updateTenant(tenantId, dto);
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getTenantUsers(@CurrentTenant() tenantId: string) {
    return this.tenantService.getTenantUsers(tenantId);
  }

  @Post('users')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createTenantUser(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTenantUserDto,
  ) {
    return this.tenantService.createTenantUser(tenantId, dto);
  }

  @Delete('users/:userId')
  @Roles(UserRole.ADMIN)
  async deleteTenantUser(
    @CurrentTenant() tenantId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.tenantService.deleteTenantUser(tenantId, targetUserId, currentUser.userId);
  }
}
