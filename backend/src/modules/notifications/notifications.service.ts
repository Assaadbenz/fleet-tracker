import { Injectable, Logger } from '@nestjs/common';
import { MaintenanceAlertPayload, MileageAlertPayload } from './interfaces/notification-payload.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendMaintenanceAlert(payload: MaintenanceAlertPayload): Promise<void> {
    this.logger.warn(
      `[MAINTENANCE ALERT] Tenant: ${payload.tenantId} | Vehicle: ${payload.plateNumber} (${payload.vehicleId}) | ` +
        `Service "${payload.serviceName}" is DUE! Reason: ${payload.triggerReason}. ` +
        `Current: ${payload.currentMileage} km | Due Mileage: ${payload.dueMileage ?? 'N/A'} | ` +
        `Due Date: ${payload.dueDate ? payload.dueDate.toISOString() : 'N/A'} | ` +
        `WorkOrder ID: ${payload.workOrderId}`,
    );

    // Extensible for Webhook/Email/SMS dispatch in production
  }

  async sendMileageLoggedNotification(payload: MileageAlertPayload): Promise<void> {
    this.logger.log(
      `[MILEAGE LOGGED] Tenant: ${payload.tenantId} | Vehicle: ${payload.plateNumber} | ` +
        `New Mileage: ${payload.newMileage} km recorded by User: ${payload.recordedByUserId}`,
    );
  }
}
