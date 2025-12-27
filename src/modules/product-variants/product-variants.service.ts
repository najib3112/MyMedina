import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariant } from './entities/product-variant.entity';

/**
 * Product Variants Service
 *
 * Bertanggung jawab untuk business logic variant produk.
 *
 * OOP Concepts:
 * - Encapsulation: Business logic untuk product variants
 * - Single Responsibility: Hanya handle variant logic
 * - Dependency Injection: Inject Repository
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access via TypeORM Repository
 */
@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Buat Variant Baru untuk Produk
   *
   * @param productId - ID produk
   * @param createVariantDto - Data variant baru
   * @returns Variant yang baru dibuat
   */
  async buatVariant(
    productId: string,
    createVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    // Validasi product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product || product.dihapusPada) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Cek apakah SKU sudah digunakan
    const skuSudahAda = await this.variantRepository.findOne({
      where: { sku: createVariantDto.sku },
    });

    if (skuSudahAda) {
      throw new ConflictException('SKU sudah digunakan');
    }

    // Buat variant baru
    const variantBaru = this.variantRepository.create({
      ...createVariantDto,
      productId,
    });

    return await this.variantRepository.save(variantBaru);
  }

  /**
   * Ambil Semua Variant dari Produk
   *
   * @param productId - ID produk
   * @param includeInactive - Include inactive variants (default: false)
   * @returns List variant
   */
  async ambilVariantByProductId(
    productId: string,
    includeInactive = false,
  ): Promise<ProductVariant[]> {
    // Validasi product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product || product.dihapusPada) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    const query = this.variantRepository
      .createQueryBuilder('variant')
      .where('variant.productId = :productId', { productId });

    if (!includeInactive) {
      query.andWhere('variant.aktif = :aktif', { aktif: true });
    }

    return await query.orderBy('variant.dibuatPada', 'ASC').getMany();
  }

  /**
   * Ambil Variant Berdasarkan ID
   *
   * @param id - ID variant
   * @returns Variant
   */
  async ambilVariantById(id: string): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException('Variant tidak ditemukan');
    }

    return variant;
  }

  /**
   * Update Variant
   *
   * @param id - ID variant
   * @param updateVariantDto - Data update
   * @returns Variant yang diupdate
   */
  async updateVariant(
    id: string,
    updateVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    const variant = await this.ambilVariantById(id);

    // Jika SKU diubah, cek apakah SKU baru sudah digunakan
    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const skuSudahAda = await this.variantRepository.findOne({
        where: { sku: updateVariantDto.sku },
      });

      if (skuSudahAda) {
        throw new ConflictException('SKU sudah digunakan');
      }
    }

    // Update variant
    Object.assign(variant, updateVariantDto);
    return await this.variantRepository.save(variant);
  }

  /**
   * Hapus Variant
   *
   * @param id - ID variant
   * @returns Success message
   */
  async hapusVariant(id: string): Promise<{ message: string }> {
    const variant = await this.ambilVariantById(id);

    // TODO: Cek apakah variant ada di order_items
    // Akan diimplementasikan setelah Order module dibuat

    await this.variantRepository.remove(variant);

    return {
      message: 'Variant berhasil dihapus',
    };
  }

  /**
   * Ambil harga variant
   * Menggunakan method entity: ambilHarga()
   * Implementation note: Perlu akses ke product.hargaDasar
   *
   * @param variantId - ID variant
   * @returns Harga variant
   */
  async ambilHargaVariant(variantId: string): Promise<number> {
    const variant = await this.ambilVariantById(variantId);
    return variant.ambilHarga();  // <-- Ini yang pakai logika di atas
  }

  /**
   * Kurangi stok variant
   * Menggunakan method entity: kurangiStok()
   *
   * @param variantId - ID variant
   * @param kuantitas - Jumlah stok yang dikurangi
   */
  async kurangiStokVariant(
    variantId: string,
    kuantitas: number,
  ): Promise<ProductVariant> {
    const variant = await this.ambilVariantById(variantId);

    // Gunakan method entity
    variant.kurangiStok(kuantitas);

    return await this.variantRepository.save(variant);
  }

  /**
   * Kembalikan stok variant
   * Menggunakan method entity: kembalikanStok()
   *
   * @param variantId - ID variant
   * @param kuantitas - Jumlah stok yang dikembalikan
   */
  async kembalikanStokVariant(
    variantId: string,
    kuantitas: number,
  ): Promise<ProductVariant> {
    const variant = await this.ambilVariantById(variantId);

    // Gunakan method entity
    variant.kembalikanStok(kuantitas);

    return await this.variantRepository.save(variant);
  }

  /**
   * Cek apakah stok tersedia
   * Menggunakan method entity: isStokTersedia()
   *
   * @param variantId - ID variant
   * @param kuantitas - Jumlah yang dicek (default 1)
   * @returns true jika stok cukup
   */
  async isStokTersediaVariant(
    variantId: string,
    kuantitas: number = 1,
  ): Promise<boolean> {
    const variant = await this.ambilVariantById(variantId);

    // Gunakan method entity
    return variant.isStokTersedia(kuantitas);
  }
}