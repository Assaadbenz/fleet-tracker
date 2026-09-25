export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type ComputedStatus = 'ACTIVE' | 'DUE_SOON' | 'MAINTENANCE' | 'INACTIVE';

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  serviceName: string;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  lastServiceMileage?: number | null;
  lastServiceDate?: string | null;
  nextDueMileage?: number | null;
  nextDueDate?: string | null;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  cost: number;
  performedAt?: string | null;
}

export interface Vehicle {
  id: string;
  vin: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  currentMileage: number;
  status: VehicleStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  maintenanceSchedules?: MaintenanceSchedule[];
  workOrders?: WorkOrder[];
}

export interface VehicleWithComputed extends Vehicle {
  computedStatus: ComputedStatus;
  nextServiceInfo?: {
    serviceName: string;
    remainingKm?: number | null;
    remainingDays?: number | null;
    isDue: boolean;
  };
}
