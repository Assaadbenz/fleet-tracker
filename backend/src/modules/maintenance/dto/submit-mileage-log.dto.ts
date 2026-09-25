import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class SubmitMileageLogDto {
  @IsUUID('4', { message: 'vehicleId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'vehicleId is required' })
  vehicleId!: string;

  @IsInt({ message: 'mileage must be an integer' })
  @Min(0, { message: 'mileage cannot be negative' })
  mileage!: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'recordedAt must be a valid ISO date' })
  recordedAt?: Date;
}
