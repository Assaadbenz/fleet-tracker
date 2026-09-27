import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { HealthModule } from './modules/health/health.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
        prefix: configService.get<string>('BULLMQ_PREFIX', 'fleet_queue'),
      }),
    }),
    PrismaModule,
    HealthModule,
    NotificationsModule,
    AuthModule,
    TenantModule,
    VehicleModule,
    MaintenanceModule,
    FuelModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
