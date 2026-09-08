import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

// Deployment marker
const DEPLOYMENT_VERSION = 'mega-aggressive-v2';

async function bootstrap() {
  logger.log('🔥 BOOTSTRAP STARTING - MEGA AGGRESSIVE VERSION');
  logger.log('Node environment:', process.env.NODE_ENV);
  logger.log('PORT:', process.env.PORT || 3001);
  logger.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
  logger.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

  try {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');

    // ULTIMATE CORS FIX - NO HELMET, NO CSRF, JUST CORS
    // Step 1: Raw Express middleware to handle CORS FIRST
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
      res.header('Access-Control-Expose-Headers', 'Content-Length,X-JSON-Response');
      
      // Handle OPTIONS preflight requests
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Step 2: Enable NestJS CORS as backup
    app.enableCors({
      origin: '*',
      credentials: false,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    });

    // Global Pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    // Swagger (development only)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('ALEM CRM System API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('docs', app, document);
    }

    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`✅ Server running on port ${port}`);
    logger.log(`🔓 CORS: OPEN TO ALL ORIGINS`);
    logger.log(`📌 Version: ${DEPLOYMENT_VERSION}`);
  } catch (error: any) {
    logger.error('❌ FAILED TO START APPLICATION');
    logger.error('Error:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

bootstrap();

