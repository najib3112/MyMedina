import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

/**
 * Categories Service
 *
 * Bertanggung jawab untuk business logic kategori produk.
 *
 * OOP Concepts:
 * - Encapsulation: Business logic untuk categories
 * - Single Responsibility: Hanya handle category logic
 * - Dependency Injection: Inject Repository
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access via TypeORM Repository
 */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Buat Kategori Baru
   *
   * @param createCategoryDto - Data kategori baru
   * @returns Kategori yang baru dibuat
   */
  async buatKategori(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Cek apakah slug sudah digunakan
    const slugSudahAda = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (slugSudahAda) {
      throw new ConflictException('Slug kategori sudah digunakan');
    }

    // Jika ada parentId, validasi parent category exists
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category tidak ditemukan');
      }
    }

    // Buat kategori baru
    const kategoriBaru = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(kategoriBaru);
  }

  /**
   * Ambil Semua Kategori
   *
   * @param includeInactive - Include inactive categories (default: false)
   * @returns List kategori
   */
  async ambilSemuaKategori(includeInactive = false): Promise<Category[]> {
    const query = this.categoryRepository.createQueryBuilder('category');

    if (!includeInactive) {
      query.where('category.aktif = :aktif', { aktif: true });
    }

    return await query
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.subKategori', 'subKategori')
      .orderBy('category.nama', 'ASC')
      .getMany();
  }

  /**
   * Ambil Kategori Berdasarkan ID
   *
   * @param id - ID kategori
   * @returns Kategori
   */
  async ambilKategoriById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'subKategori'],
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return category;
  }

  /**
   * Update Kategori
   *
   * @param id - ID kategori
   * @param updateCategoryDto - Data update
   * @returns Kategori yang diupdate
   */
  async updateKategori(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.ambilKategoriById(id);

    // Jika slug diubah, cek apakah slug baru sudah digunakan
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const slugSudahAda = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (slugSudahAda) {
        throw new ConflictException('Slug kategori sudah digunakan');
      }
    }

    // Jika parentId diubah, validasi parent category exists
    if (updateCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException('Parent category tidak ditemukan');
      }

      // Prevent circular reference (kategori tidak boleh jadi parent dari dirinya sendiri)
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException(
          'Kategori tidak boleh menjadi parent dari dirinya sendiri',
        );
      }
    }

    // Update kategori
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * Hapus Kategori
   *
   * @param id - ID kategori
   * @returns Success message
   */
  async hapusKategori(id: string): Promise<{ message: string }> {
    const category = await this.ambilKategoriById(id);

    // Cek apakah kategori memiliki sub-kategori
    if (category.subKategori && category.subKategori.length > 0) {
      throw new ConflictException(
        'Kategori tidak dapat dihapus karena memiliki sub-kategori',
      );
    }

    // TODO: Cek apakah kategori memiliki produk
    // Akan diimplementasikan setelah Product entity dibuat

    await this.categoryRepository.remove(category);

    return {
      message: 'Kategori berhasil dihapus',
    };
  }

  /**
   * Ambil semua sub-kategori
   * Menggunakan method entity: ambilSubKategori()
   *
   * @param categoryId - ID kategori
   * @returns Array dari Category (sub-categories)
   */
  async ambilSubKategoriCategory(categoryId: string): Promise<Category[]> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['subKategori'],
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Gunakan method entity
    return category.ambilSubKategori();
  }

  /**
   * Ambil semua products dalam kategori
   * Menggunakan method entity: ambilProducts()
   *
   * @param categoryId - ID kategori
   * @returns Array dari Product
   */
  async ambilProductsCategory(categoryId: string): Promise<any[]> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Gunakan method entity
    return category.ambilProducts();
  }
}
