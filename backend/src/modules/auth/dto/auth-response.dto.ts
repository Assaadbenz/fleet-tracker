import { UserRole } from '@prisma/client';

export class UserPayloadDto {
  id!: string;
  email!: string;
  role!: UserRole;
  tenantId!: string;
}

export class TenantPayloadDto {
  id!: string;
  name!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: UserPayloadDto;
  tenant!: TenantPayloadDto;
}
