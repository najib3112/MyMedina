import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

/**
 * Upload Service
 *
 * Bertanggung jawab untuk upload file ke Cloudinary.
 *
 * OOP Concepts:
 * - Encapsulation: Upload logic dalam satu service
 * - Single Responsibility: Hanya handle file upload
 * - Dependency Injection: Inject Cloudinary instance
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Strategy Pattern: Different upload strategies (image, video, etc.)
 */
@Injectable()
export class UploadService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof v2) {}

  /**
   * Upload Image ke Cloudinary
   *
   * @param file - File dari multer (Express.Multer.File)
   * @param folder - Folder di Cloudinary (default: 'mymedina')
   * @returns URL gambar yang diupload
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'mymedina',
  ): Promise<string> {
    // Validasi file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File harus berupa gambar');
    }

    // Validasi file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Ukuran file maksimal 5MB');
    }

    // Check if Cloudinary is configured
    const config = this.cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.warn('⚠️  Cloudinary not configured - Returning placeholder URL');
      // Return placeholder URL untuk development
      return `https://via.placeholder.com/500x500.png?text=${encodeURIComponent(file.originalname)}`;
    }

    // Upload ke Cloudinary
    return new Promise<string>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Max 1000x1000
            { quality: 'auto' }, // Auto quality optimization
            { fetch_format: 'auto' }, // Auto format (WebP if supported)
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(
              new BadRequestException(
                `Upload gagal: ${error.message || 'Unknown error'}`,
              ),
            );
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new BadRequestException('Upload gagal: No result'));
          }
        },
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Hapus Image dari Cloudinary
   *
   * @param imageUrl - URL gambar yang akan dihapus
   * @returns Success message
   */
  async deleteImage(imageUrl: string): Promise<{ message: string }> {
    // Check if Cloudinary is configured
    const config = this.cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      console.warn('⚠️  Cloudinary not configured - Skipping delete');
      return { message: 'Cloudinary not configured - Delete skipped' };
    }

    // Extract public_id from URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/mymedina/product.jpg
    // public_id: mymedina/product
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) {
      throw new BadRequestException('Invalid Cloudinary URL');
    }

    // Get public_id (skip version if exists)
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    const versionIndex = pathAfterUpload.findIndex((part) =>
      part.startsWith('v'),
    );
    const publicIdParts =
      versionIndex !== -1
        ? pathAfterUpload.slice(versionIndex + 1)
        : pathAfterUpload;

    // Remove file extension
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');

    try {
      await this.cloudinary.uploader.destroy(publicId);
      return { message: 'Gambar berhasil dihapus dari Cloudinary' };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new BadRequestException('Gagal menghapus gambar dari Cloudinary');
    }
  }
}
