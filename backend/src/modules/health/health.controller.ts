import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly startupTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async check() {
    const memory = process.memoryUsage();
    let databaseStatus = 'UP';
    let databaseLatencyMs = 0;

    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseLatencyMs = Date.now() - dbStart;
    } catch {
      databaseStatus = 'DOWN';
    }

    const uptimeSeconds = Math.floor((Date.now() - this.startupTime) / 1000);

    return {
      status: databaseStatus === 'UP' ? 'healthy' : 'degraded',
      service: 'fleet-tracker-api',
      timestamp: new Date().toISOString(),
      uptime: `${uptimeSeconds}s`,
      database: {
        status: databaseStatus,
        latencyMs: databaseLatencyMs,
      },
      system: {
        nodeVersion: process.version,
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
