import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user || !user.tenantId) {
      throw new UnauthorizedException('Tenant context missing from session');
    }

    return user.tenantId;
  },
);
