import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP_ACCESS');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();
    const startTime = Date.now();

    const { method, url } = req;
    const user = (req as any).user;
    const tenantId = user?.tenantId || req.headers['x-tenant-id'] || 'anonymous';
    const userId = user?.userId || 'anonymous';

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        this.logger.log(
          `[${method}] ${url} -> ${statusCode} (${duration}ms) | Tenant: ${tenantId} | User: ${userId}`,
        );
      }),
    );
  }
}
