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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * Products Controller
 *
 * HTTP request handlers untuk produk.
 *
 * OOP Concepts:
 * - Separation of Concerns: Controller hanya handle HTTP, logic di Service
 * - Dependency Injection: Inject ProductsService
 *
 * Design Pattern:
 * - MVC Pattern: Controller layer
 * - Guard Pattern: Authentication & Authorization
 *
 * Endpoints:
 * - GET    /api/products              - List products with pagination, filter, search (Public)
 * - GET    /api/products/:id          - Get product detail (Public)
 * - POST   /api/products              - Create product (Admin only)
 * - PUT    /api/products/:id          - Update product (Admin only)
 * - DELETE /api/products/:id          - Delete product (Admin only)
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create Product (Admin only)
   *
   * POST /api/products
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.buatProduk(createProductDto);
    return {
      message: 'Produk berhasil dibuat',
      data: product,
    };
  }

  /**
   * Get All Products with Pagination, Filter, Search (Public)
   *
   * GET /api/products?page=1&limit=10&search=gamis&categoryId=xxx&status=READY&active=true
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('active') active?: string,
  ) {
    const result = await this.productsService.ambilSemuaProduk({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      categoryId,
      status,
      active: active === 'false' ? false : true,
    });

    return {
      message: 'Berhasil mengambil data produk',
      ...result,
    };
  }

  /**
   * Get Product by ID (Public)
   *
   * GET /api/products/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.ambilProdukById(id);
    return {
      message: 'Berhasil mengambil data produk',
      data: product,
    };
  }

  /**
   * Update Product (Admin only)
   *
   * PUT /api/products/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.updateProduk(
      id,
      updateProductDto,
    );
    return {
      message: 'Produk berhasil diupdate',
      data: product,
    };
  }

  /**
   * Delete Product (Admin only)
   *
   * DELETE /api/products/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.productsService.hapusProduk(id);
  }
}
