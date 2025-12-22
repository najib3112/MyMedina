import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

/**
 * Products Module
 *
 * Module untuk mengelola produk.
 *
 * OOP Concepts:
 * - Modularity: Product functionality dipisahkan dalam module tersendiri
 * - Separation of Concerns: Product logic separated from other modules
 * - Dependency Injection: All dependencies registered here
 *
 * Design Pattern:
 * - Module Pattern: Organizing related code
 *
 * Components:
 * - Entity: Product
 * - Service: ProductsService (business logic)
 * - Controller: ProductsController (HTTP handlers)
 *
 * Dependencies:
 * - CategoriesModule: Untuk validasi category_id
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule, // Import untuk akses Category repository
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService], // Export untuk digunakan di module lain
})
export class ProductsModule {}
