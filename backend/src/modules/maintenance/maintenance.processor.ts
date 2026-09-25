import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DAILY_MAINTENANCE_JOB, MAINTENANCE_QUEUE } from './constants/maintenance.constants';
import { MaintenanceService } from './maintenance.service';

@Processor(MAINTENANCE_QUEUE)
export class MaintenanceProcessor extends WorkerHost {
  private readonly logger = new Logger(MaintenanceProcessor.name);

  constructor(private readonly maintenanceService: MaintenanceService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing BullMQ job [ID: ${job.id}, Name: ${job.name}]...`);

    switch (job.name) {
      case DAILY_MAINTENANCE_JOB: {
        const result = await this.maintenanceService.scanDueMaintenanceSchedules();
        this.logger.log(
          `Daily maintenance scan completed. Schedules checked: ${result.processed}, Work orders generated: ${result.workOrdersCreated}`,
        );
        return result;
      }

      default:
        this.logger.warn(`Unknown job name encountered: ${job.name}`);
        return null;
    }
  }
}
