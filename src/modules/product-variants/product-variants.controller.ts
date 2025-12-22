import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

/**
 * Product Variants Controller
 *
 * HTTP request handlers untuk variant produk.
 *
 * OOP Concepts:
 * - Separation of Concerns: Controller hanya handle HTTP, logic di Service
 * - Dependency Injection: Inject ProductVariantsService
 *
 * Design Pattern:
 * - MVC Pattern: Controller layer
 * - Guard Pattern: Authentication & Authorization
 *
 * Endpoints:
 * - GET    /api/products/:productId/variants       - List variants by product (Public)
 * - POST   /api/products/:productId/variants       - Create variant (Admin only)
 * - GET    /api/variants/:id                       - Get variant detail (Public)
 * - PUT    /api/variants/:id                       - Update variant (Admin only)
 * - DELETE /api/variants/:id                       - Delete variant (Admin only)
 */
@Controller()
export class ProductVariantsController {
  constructor(
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  /**
   * Create Variant for Product (Admin only)
   *
   * POST /api/products/:productId/variants
   */
  @Post('products/:productId/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateProductVariantDto,
  ) {
    const variant = await this.productVariantsService.buatVariant(
      productId,
      createVariantDto,
    );
    return {
      message: 'Variant berhasil dibuat',
      data: variant,
    };
  }

  /**
   * Get All Variants by Product (Public)
   *
   * GET /api/products/:productId/variants?includeInactive=true
   */
  @Get('products/:productId/variants')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const variants = await this.productVariantsService.ambilVariantByProductId(
      productId,
      includeInactive === 'true',
    );
    return {
      message: 'Berhasil mengambil data variant',
      data: variants,
      total: variants.length,
    };
  }

  /**
   * Get Variant by ID (Public)
   *
   * GET /api/variants/:id
   */
  @Get('variants/:id')
  async findOne(@Param('id') id: string) {
    const variant = await this.productVariantsService.ambilVariantById(id);
    return {
      message: 'Berhasil mengambil data variant',
      data: variant,
    };
  }

  /**
   * Update Variant (Admin only)
   *
   * PUT /api/variants/:id
   */
  @Put('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async update(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateProductVariantDto,
  ) {
    const variant = await this.productVariantsService.updateVariant(
      id,
      updateVariantDto,
    );
    return {
      message: 'Variant berhasil diupdate',
      data: variant,
    };
  }

  /**
   * Delete Variant (Admin only)
   *
   * DELETE /api/variants/:id
   */
  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.productVariantsService.hapusVariant(id);
  }
}
