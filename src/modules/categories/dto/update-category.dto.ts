import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * Update Category DTO
 *
 * Data Transfer Object untuk update kategori.
 *
 * OOP Concepts:
 * - Inheritance: Extends CreateCategoryDto dengan PartialType
 * - DRY Principle: Reuse validation rules dari CreateCategoryDto
 *
 * Design Pattern:
 * - DTO Pattern: Separate data structure for API input
 *
 * Note:
 * PartialType membuat semua field menjadi optional
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
