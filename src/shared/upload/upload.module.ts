import { Module } from '@nestjs/common';
import { CloudinaryProvider } from '../../config/cloudinary.config';
import { AuthModule } from '../../modules/auth/auth.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

/**
 * Upload Module
 *
 * Module untuk mengelola file upload (Cloudinary).
 *
 * OOP Concepts:
 * - Modularity: Upload functionality dipisahkan dalam module tersendiri
 * - Separation of Concerns: Upload logic separated from other modules
 * - Dependency Injection: All dependencies registered here
 *
 * Design Pattern:
 * - Module Pattern: Organizing related code
 * - Provider Pattern: Cloudinary instance provided via factory
 *
 * Components:
 * - Provider: CloudinaryProvider (Cloudinary instance)
 * - Service: UploadService (upload logic)
 * - Controller: UploadController (HTTP handlers)
 *
 * Note:
 * Cloudinary credentials are optional for development.
 * If not configured, placeholder URLs will be returned.
 */
@Module({
  imports: [AuthModule], // Import AuthModule untuk JwtAuthGuard & RolesGuard
  controllers: [UploadController],
  providers: [CloudinaryProvider, UploadService],
  exports: [UploadService], // Export untuk digunakan di module lain
})
export class UploadModule {}
