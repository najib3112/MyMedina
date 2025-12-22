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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * Categories Controller
 *
 * HTTP request handlers untuk kategori produk.
 *
 * OOP Concepts:
 * - Separation of Concerns: Controller hanya handle HTTP, logic di Service
 * - Dependency Injection: Inject CategoriesService
 *
 * Design Pattern:
 * - MVC Pattern: Controller layer
 * - Guard Pattern: Authentication & Authorization
 *
 * Endpoints:
 * - GET    /api/categories           - List all categories (Public)
 * - GET    /api/categories/:id       - Get category detail (Public)
 * - POST   /api/categories           - Create category (Admin only)
 * - PUT    /api/categories/:id       - Update category (Admin only)
 * - DELETE /api/categories/:id       - Delete category (Admin only)
 */
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create Category (Admin only)
   *
   * POST /api/categories
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category =
      await this.categoriesService.buatKategori(createCategoryDto);
    return {
      message: 'Kategori berhasil dibuat',
      data: category,
    };
  }

  /**
   * Get All Categories (Public)
   *
   * GET /api/categories?includeInactive=true
   */
  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const categories = await this.categoriesService.ambilSemuaKategori(
      includeInactive === 'true',
    );
    return {
      message: 'Berhasil mengambil data kategori',
      data: categories,
      total: categories.length,
    };
  }

  /**
   * Get Category by ID (Public)
   *
   * GET /api/categories/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.ambilKategoriById(id);
    return {
      message: 'Berhasil mengambil data kategori',
      data: category,
    };
  }

  /**
   * Update Category (Admin only)
   *
   * PUT /api/categories/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.updateKategori(
      id,
      updateCategoryDto,
    );
    return {
      message: 'Kategori berhasil diupdate',
      data: category,
    };
  }

  /**
   * Delete Category (Admin only)
   *
   * DELETE /api/categories/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.OWNER)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.categoriesService.hapusKategori(id);
  }
}
