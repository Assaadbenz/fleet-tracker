import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getOverview(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getOverview(tenantId);
  }

  @Get('costs')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getCostBreakdown(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getCostBreakdown(tenantId);
  }
}
