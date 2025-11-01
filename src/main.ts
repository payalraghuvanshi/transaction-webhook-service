import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

// Initializes and starts the NestJS application
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // Enable global DTO validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const port = process.env.PORT ?? 5000;
    await app.listen(port);

    logger.log(`🚀 Webhook Service is running on: http://localhost:${port}`);
    logger.log(`📊 Health Check: http://localhost:${port}/`);
    logger.log(`📥 Webhook Endpoint: http://localhost:${port}/v1/webhooks/transactions`);
    logger.log(`🔍 Transaction Query: http://localhost:${port}/v1/transactions/:transaction_id`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
