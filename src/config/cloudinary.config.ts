import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary Configuration Provider
 *
 * OOP Concepts:
 * - Factory Pattern: Creates and configures Cloudinary instance
 * - Dependency Injection: Uses ConfigService
 *
 * Design Pattern:
 * - Provider Pattern: Provides configured Cloudinary instance
 *
 * Note:
 * Cloudinary credentials are optional for development.
 * If not configured, upload will be skipped gracefully.
 */
export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

    // Only configure if credentials are provided
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      console.log('✅ Cloudinary configured successfully');
    } else {
      console.log(
        '⚠️  Cloudinary credentials not found - Image upload will be skipped',
      );
    }

    return cloudinary;
  },
  inject: [ConfigService],
};
