import { VehicleStatus, WorkOrderStatus } from '@prisma/client';

export interface MaintenanceAlertPayload {
  tenantId: string;
  vehicleId: string;
  plateNumber: string;
  serviceName: string;
  triggerReason: 'MILEAGE_EXCEEDED' | 'DATE_OVERDUE' | 'MANUAL_TRIGGER';
  currentMileage: number;
  dueMileage?: number | null;
  dueDate?: Date | null;
  workOrderId: string;
}

export interface MileageAlertPayload {
  tenantId: string;
  vehicleId: string;
  plateNumber: string;
  newMileage: number;
  recordedByUserId: string;
  recordedAt: Date;
}
