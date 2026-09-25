import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateTenantUserDto {
  @IsEmail({}, { message: 'A valid email is required' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be ADMIN, MANAGER, or DRIVER' })
  role!: UserRole;
}
