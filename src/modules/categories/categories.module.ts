import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

/**
 * Categories Module
 *
 * Module untuk mengelola kategori produk.
 *
 * OOP Concepts:
 * - Modularity: Category functionality dipisahkan dalam module tersendiri
 * - Separation of Concerns: Category logic separated from other modules
 * - Dependency Injection: All dependencies registered here
 *
 * Design Pattern:
 * - Module Pattern: Organizing related code
 *
 * Components:
 * - Entity: Category
 * - Service: CategoriesService (business logic)
 * - Controller: CategoriesController (HTTP handlers)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [TypeOrmModule, CategoriesService], // Export untuk digunakan di module lain
})
export class CategoriesModule {}
