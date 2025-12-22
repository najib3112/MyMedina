import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariant } from './entities/product-variant.entity';

/**
 * Product Variants Module
 *
 * Module untuk mengelola variant produk (size, color, stock).
 *
 * OOP Concepts:
 * - Modularity: Variant functionality dipisahkan dalam module tersendiri
 * - Separation of Concerns: Variant logic separated from other modules
 * - Dependency Injection: All dependencies registered here
 *
 * Design Pattern:
 * - Module Pattern: Organizing related code
 *
 * Components:
 * - Entity: ProductVariant
 * - Service: ProductVariantsService (business logic)
 * - Controller: ProductVariantsController (HTTP handlers)
 *
 * Dependencies:
 * - ProductsModule: Untuk validasi product_id
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant]),
    ProductsModule, // Import untuk akses Product repository
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [TypeOrmModule, ProductVariantsService], // Export untuk digunakan di module lain
})
export class ProductVariantsModule {}
