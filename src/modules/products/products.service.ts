import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

/**
 * Products Service
 *
 * Bertanggung jawab untuk business logic produk.
 *
 * OOP Concepts:
 * - Encapsulation: Business logic untuk products
 * - Single Responsibility: Hanya handle product logic
 * - Dependency Injection: Inject Repository
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access via TypeORM Repository
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Buat Produk Baru
   *
   * @param createProductDto - Data produk baru
   * @returns Produk yang baru dibuat
   */
  async buatProduk(createProductDto: CreateProductDto): Promise<Product> {
    // Validasi category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Cek apakah slug sudah digunakan
    const slugSudahAda = await this.productRepository.findOne({
      where: { slug: createProductDto.slug },
    });

    if (slugSudahAda) {
      throw new ConflictException('Slug produk sudah digunakan');
    }

    // Buat produk baru
    const produkBaru = this.productRepository.create(createProductDto);
    return await this.productRepository.save(produkBaru);
  }

  /**
   * Ambil Semua Produk dengan Pagination, Filter, Search
   *
   * @param options - Query options (page, limit, search, categoryId, status, active)
   * @returns List produk dengan pagination info
   */
  async ambilSemuaProduk(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    active?: boolean;
  }): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Filter by search (nama atau deskripsi)
    if (options.search) {
      query.andWhere(
        '(product.nama ILIKE :search OR product.deskripsi ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    // Filter by category
    if (options.categoryId) {
      query.andWhere('product.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    // Filter by status
    if (options.status) {
      query.andWhere('product.status = :status', { status: options.status });
    }

    // Filter by active (default: true)
    if (options.active !== undefined) {
      query.andWhere('product.aktif = :aktif', { aktif: options.active });
    } else {
      query.andWhere('product.aktif = :aktif', { aktif: true });
    }

    // Exclude soft-deleted products
    query.andWhere('product.dihapusPada IS NULL');

    // Count total
    const total = await query.getCount();

    // Apply pagination
    query.skip(skip).take(limit);

    // Order by created_at DESC
    query.orderBy('product.dibuatPada', 'DESC');

    const data = await query.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Ambil Produk Berdasarkan ID
   *
   * @param id - ID produk
   * @returns Produk
   */
  async ambilProdukById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product || product.dihapusPada) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return product;
  }

  /**
   * Update Produk
   *
   * @param id - ID produk
   * @param updateProductDto - Data update
   * @returns Produk yang diupdate
   */
  async updateProduk(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.ambilProdukById(id);

    // Jika categoryId diubah, validasi category exists
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Kategori tidak ditemukan');
      }
    }

    // Jika slug diubah, cek apakah slug baru sudah digunakan
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const slugSudahAda = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
      });

      if (slugSudahAda) {
        throw new ConflictException('Slug produk sudah digunakan');
      }
    }

    // Update produk
    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  /**
   * Hapus Produk (Soft Delete)
   *
   * @param id - ID produk
   * @returns Success message
   */
  async hapusProduk(id: string): Promise<{ message: string }> {
    const product = await this.ambilProdukById(id);

    // TODO: Cek apakah produk memiliki variants
    // Akan diimplementasikan setelah ProductVariant entity dibuat

    // Soft delete
    await this.productRepository.softRemove(product);

    return {
      message: 'Produk berhasil dihapus',
    };
  }

  /**
   * Ambil semua variants dari product
   * Menggunakan method entity: ambilVariants()
   *
   * @param productId - ID produk
   * @returns Array dari ProductVariant
   */
  async ambilVariantsProduct(productId: string): Promise<any[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Gunakan method entity
    return product.ambilVariants();
  }

  /**
   * Ambil total stok tersedia dari semua variants
   * Menggunakan method entity: ambilStokTersedia()
   *
   * @param productId - ID produk
   * @returns Total stok
   */
  async ambilStokTersediaProduct(productId: string): Promise<number> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Gunakan method entity
    return product.ambilStokTersedia();
  }

  /**
   * Cek apakah product tersedia
   * Menggunakan method entity: isTersedia()
   *
   * @param productId - ID produk
   * @returns true jika tersedia, false jika tidak
   */
  async isTersediaProduct(productId: string): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });

    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Gunakan method entity
    return product.isTersedia();
  }
}
