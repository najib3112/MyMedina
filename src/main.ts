import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Application Bootstrap
 * Entry point of the NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe (auto-validate DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // CORS (allow frontend to access API)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(
    `🚀 MyMedina Backend is running on: http://localhost:${port}/api`,
  );
  console.log(
    `📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`,
  );
}

void bootstrap();
