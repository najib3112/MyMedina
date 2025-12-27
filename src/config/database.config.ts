import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

/**
 * Database Configuration
 * TypeORM configuration for PostgreSQL
 *
 * OOP Concepts:
 * - Encapsulation: Database config in one place
 * - Single Responsibility: Only handles database configuration
 */
export const databaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mymedina',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  logging: ['error', 'warn'], // Only log errors and warnings, not SELECT queries
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: true, // Auto-run migrations on startup
});
