import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  CRON_DAILY_MIDNIGHT,
  DAILY_MAINTENANCE_JOB,
  MAINTENANCE_QUEUE,
} from './constants/maintenance.constants';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceProcessor } from './maintenance.processor';
import { MaintenanceService } from './maintenance.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MAINTENANCE_QUEUE,
    }),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceProcessor],
  exports: [MaintenanceService, BullModule],
})
export class MaintenanceModule implements OnModuleInit {
  private readonly logger = new Logger(MaintenanceModule.name);

  constructor(@InjectQueue(MAINTENANCE_QUEUE) private readonly maintenanceQueue: Queue) {}

  async onModuleInit(): Promise<void> {
    try {
      // Schedule repeatable daily cron job at midnight (0 0 * * *)
      await this.maintenanceQueue.upsertJobScheduler(
        'daily-maintenance-check-scheduler',
        { pattern: CRON_DAILY_MIDNIGHT },
        {
          name: DAILY_MAINTENANCE_JOB,
          data: { scheduled: true },
        },
      );
      this.logger.log(
        `Registered BullMQ repeatable job "${DAILY_MAINTENANCE_JOB}" with cron pattern "${CRON_DAILY_MIDNIGHT}"`,
      );
    } catch (error) {
      this.logger.error('Failed to register repeatable BullMQ maintenance job', error);
    }
  }
}
