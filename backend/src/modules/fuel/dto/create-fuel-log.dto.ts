import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateFuelLogDto {
  @IsUUID()
  vehicleId!: string;

  @IsNumber()
  @IsPositive()
  liters!: number;

  @IsNumber()
  @IsPositive()
  totalCost!: number;

  @IsNumber()
  @Min(0)
  odometer!: number;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsBoolean()
  fullTank?: boolean;

  @IsOptional()
  @IsString()
  stationName?: string;
}
