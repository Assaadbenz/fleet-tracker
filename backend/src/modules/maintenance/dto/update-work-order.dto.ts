import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsEnum(WorkOrderStatus, { message: 'status must be PENDING, IN_PROGRESS, or COMPLETED' })
  status?: WorkOrderStatus;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'cost must be a valid decimal amount' })
  @Min(0, { message: 'cost cannot be negative' })
  cost?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'performedAt must be a valid ISO date' })
  performedAt?: Date;
}
