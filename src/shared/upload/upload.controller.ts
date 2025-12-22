import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { Role } from '../../modules/auth/enums/role.enum';
import { UploadService } from './upload.service';

/**
 * Upload Controller
 *
 * HTTP request handlers untuk upload file.
 *
 * OOP Concepts:
 * - Separation of Concerns: Controller hanya handle HTTP, logic di Service
 * - Dependency Injection: Inject UploadService
 *
 * Design Pattern:
 * - MVC Pattern: Controller layer
 * - Guard Pattern: Authentication & Authorization
 * - Interceptor Pattern: File upload handling
 *
 * Endpoints:
 * - POST /api/upload/image - Upload image (Admin only)
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload Image (Admin only)
   *
   * POST /api/upload/image
   *
   * Request:
   * - Content-Type: multipart/form-data
   * - Body: file (image file)
   *
   * Response:
   * {
   *   "message": "Gambar berhasil diupload",
   *   "url": "https://res.cloudinary.com/..."
   * }
   */
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadImage(file);
    return {
      message: 'Gambar berhasil diupload',
      url,
    };
  }
}
