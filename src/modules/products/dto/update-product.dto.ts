import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * Update Product DTO
 *
 * Data Transfer Object untuk update produk.
 *
 * OOP Concepts:
 * - Inheritance: Extends CreateProductDto dengan PartialType
 * - DRY Principle: Reuse validation rules dari CreateProductDto
 *
 * Design Pattern:
 * - DTO Pattern: Separate data structure for API input
 *
 * Note:
 * PartialType membuat semua field menjadi optional
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
