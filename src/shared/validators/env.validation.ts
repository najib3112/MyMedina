import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

/**
 * Environment Variables Validation
 *
 * OOP Concepts:
 * - Encapsulation: Environment validation in one place
 * - Type Safety: Ensures all required env vars are present
 */

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  FRONTEND_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
