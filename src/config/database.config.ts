import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

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
  password: process.env.DB_PASSWORD || '123321',
  database: process.env.DB_NAME || 'mymedina',
  // Use process.cwd() for absolute path - works in both dev and prod
  entities: [join(process.cwd(), 'dist/**/*.entity.js')],
  logging: ['error', 'warn'], // Only log errors and warnings
  migrations: [join(process.cwd(), 'dist/database/migrations/*.js')],
  migrationsRun: true, // Auto-run migrations on startup
  synchronize: true, // Disable auto-sync to prevent schema conflicts
});
