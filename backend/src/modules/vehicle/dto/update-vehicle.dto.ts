import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 2)
  year?: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
