import { PartialType } from '@nestjs/mapped-types';
import { CreateProductVariantDto } from './create-product-variant.dto';

/**
 * Update Product Variant DTO
 *
 * Data Transfer Object untuk update variant produk.
 *
 * OOP Concepts:
 * - Inheritance: Extends CreateProductVariantDto dengan PartialType
 * - DRY Principle: Reuse validation rules dari CreateProductVariantDto
 *
 * Design Pattern:
 * - DTO Pattern: Separate data structure for API input
 *
 * Note:
 * PartialType membuat semua field menjadi optional
 */
export class UpdateProductVariantDto extends PartialType(
  CreateProductVariantDto,
) {}
