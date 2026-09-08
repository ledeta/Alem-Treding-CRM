import { Controller, Get } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  /**
   * Health check endpoint for Render deployment
   * Returns 200 OK if service is healthy
   */
  @Get()
  @Public()
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Diagnostic endpoint to verify backend is working
   */
  @Get('diagnose')
  @Public()
  diagnose() {
    return {
      status: 'ok',
      message: 'Backend is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT || 3001,
      nodeVersion: process.version,
      database: process.env.DATABASE_URL ? 'Configured (Render)' : (process.env.DB_HOST ? 'Configured (Local)' : 'Not configured'),
    };
  }
}
