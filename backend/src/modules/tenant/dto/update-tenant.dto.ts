import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Tenant company name cannot be empty' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  name!: string;
}
