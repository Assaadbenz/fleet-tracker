import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'VIN is required' })
  @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
  vin!: string;

  @IsString()
  @IsNotEmpty({ message: 'License plate number is required' })
  @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
  plateNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Make is required (e.g. Ford, Volvo)' })
  make!: string;

  @IsString()
  @IsNotEmpty({ message: 'Model is required (e.g. F-150, VNL 860)' })
  model!: string;

  @IsInt({ message: 'Year must be a valid 4-digit year' })
  @Min(1990)
  @Max(new Date().getFullYear() + 2)
  year!: number;

  @IsOptional()
  @IsInt({ message: 'Initial current mileage must be an integer' })
  @Min(0)
  currentMileage?: number;
}
