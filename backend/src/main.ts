import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter, HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3002',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3003);
  console.log(`🚀 Server is running on: http://localhost:${process.env.PORT ?? 3003}/api`);
}
bootstrap();
