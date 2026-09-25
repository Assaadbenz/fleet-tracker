import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateMaintenanceScheduleDto {
  @IsUUID('4', { message: 'vehicleId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'vehicleId is required' })
  vehicleId!: string;

  @IsString()
  @IsNotEmpty({ message: 'serviceName is required (e.g., Oil Change, Brake Inspection)' })
  serviceName!: string;

  @IsOptional()
  @IsInt({ message: 'intervalKm must be an integer' })
  @Min(1, { message: 'intervalKm must be at least 1 km' })
  intervalKm?: number;

  @IsOptional()
  @IsInt({ message: 'intervalMonths must be an integer' })
  @Min(1, { message: 'intervalMonths must be at least 1 month' })
  intervalMonths?: number;

  @IsOptional()
  @IsInt({ message: 'lastServiceMileage must be an integer' })
  @Min(0, { message: 'lastServiceMileage cannot be negative' })
  lastServiceMileage?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'lastServiceDate must be a valid ISO date' })
  lastServiceDate?: Date;
}
