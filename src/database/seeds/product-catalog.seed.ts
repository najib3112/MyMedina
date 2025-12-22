import { DataSource } from 'typeorm';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { Category } from '../../modules/categories/entities/category.entity';
import { ProductVariant } from '../../modules/product-variants/entities/product-variant.entity';
import { Product } from '../../modules/products/entities/product.entity';

export async function seedProductCatalog(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const variantRepo = dataSource.getRepository(ProductVariant);

  console.log('🌱 Starting Product Catalog Seeding...');

  // ========================================
  // 1. SEED CATEGORIES
  // ========================================
  console.log('📁 Seeding Categories...');

  const categories = [
    {
      nama: 'Gamis',
      slug: 'gamis',
      deskripsi: 'Koleksi gamis syari untuk muslimah',
      aktif: true,
    },
    {
      nama: 'Tunik',
      slug: 'tunik',
      deskripsi: 'Tunik casual dan formal untuk sehari-hari',
      aktif: true,
    },
    {
      nama: 'Hijab',
      slug: 'hijab',
      deskripsi: 'Berbagai jenis hijab dan kerudung',
      aktif: true,
    },
    {
      nama: 'Aksesoris',
      slug: 'aksesoris',
      deskripsi: 'Aksesoris pelengkap busana muslimah',
      aktif: true,
    },
    {
      nama: 'Mukena',
      slug: 'mukena',
      deskripsi: 'Mukena untuk ibadah sehari-hari',
      aktif: true,
    },
  ];

  const savedCategories = await categoryRepo.save(categories);
  console.log(`✅ Created ${savedCategories.length} categories`);

  // ========================================
  // 2. SEED PRODUCTS
  // ========================================
  console.log('📦 Seeding Products...');

  const products = [
    // Gamis (2 products)
    {
      categoryId: savedCategories[0].id,
      nama: 'Gamis Syari Premium',
      slug: 'gamis-syari-premium',
      deskripsi: 'Gamis syari dengan bahan premium, nyaman dipakai seharian',
      hargaDasar: 350000,
      berat: 500,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl:
        'https://via.placeholder.com/500x500.png?text=Gamis+Syari+Premium',
    },
    {
      categoryId: savedCategories[0].id,
      nama: 'Gamis Katun Jepang',
      slug: 'gamis-katun-jepang',
      deskripsi: 'Gamis dengan bahan katun jepang yang adem dan lembut',
      hargaDasar: 280000,
      berat: 450,
      status: ProductStatus.PO,
      aktif: true,
      gambarUrl:
        'https://via.placeholder.com/500x500.png?text=Gamis+Katun+Jepang',
    },
    // Tunik (2 products)
    {
      categoryId: savedCategories[1].id,
      nama: 'Tunik Casual Daily',
      slug: 'tunik-casual-daily',
      deskripsi: 'Tunik casual untuk aktivitas sehari-hari',
      hargaDasar: 180000,
      berat: 300,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Tunik+Casual',
    },
    {
      categoryId: savedCategories[1].id,
      nama: 'Tunik Formal Office',
      slug: 'tunik-formal-office',
      deskripsi: 'Tunik formal untuk ke kantor atau acara resmi',
      hargaDasar: 220000,
      berat: 350,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Tunik+Formal',
    },
    // Hijab (2 products)
    {
      categoryId: savedCategories[2].id,
      nama: 'Pashmina Ceruti',
      slug: 'pashmina-ceruti',
      deskripsi: 'Pashmina bahan ceruti premium, tidak licin',
      hargaDasar: 45000,
      berat: 100,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Pashmina+Ceruti',
    },
    {
      categoryId: savedCategories[2].id,
      nama: 'Hijab Segi Empat Voal',
      slug: 'hijab-segi-empat-voal',
      deskripsi: 'Hijab segi empat bahan voal yang adem',
      hargaDasar: 35000,
      berat: 80,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Hijab+Voal',
    },
    // Aksesoris (2 products)
    {
      categoryId: savedCategories[3].id,
      nama: 'Bros Hijab Premium',
      slug: 'bros-hijab-premium',
      deskripsi: 'Bros hijab dengan desain elegan',
      hargaDasar: 25000,
      berat: 50,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Bros+Hijab',
    },
    {
      categoryId: savedCategories[3].id,
      nama: 'Inner Hijab Ciput',
      slug: 'inner-hijab-ciput',
      deskripsi: 'Inner hijab ciput anti pusing',
      hargaDasar: 15000,
      berat: 30,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Inner+Ciput',
    },
    // Mukena (2 products)
    {
      categoryId: savedCategories[4].id,
      nama: 'Mukena Katun Rayon',
      slug: 'mukena-katun-rayon',
      deskripsi: 'Mukena dengan bahan katun rayon yang adem',
      hargaDasar: 150000,
      berat: 400,
      status: ProductStatus.READY,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Mukena+Katun',
    },
    {
      categoryId: savedCategories[4].id,
      nama: 'Mukena Traveling Pouch',
      slug: 'mukena-traveling-pouch',
      deskripsi: 'Mukena praktis dengan pouch untuk traveling',
      hargaDasar: 120000,
      berat: 300,
      status: ProductStatus.PO,
      aktif: true,
      gambarUrl: 'https://via.placeholder.com/500x500.png?text=Mukena+Travel',
    },
  ];

  const savedProducts = await productRepo.save(products);
  console.log(`✅ Created ${savedProducts.length} products`);

  // ========================================
  // 3. SEED PRODUCT VARIANTS
  // ========================================
  console.log('🎨 Seeding Product Variants...');

  const variants: any[] = [];
  const ukuranList = ['S', 'M', 'L', 'XL', 'XXL', 'All Size'];
  const warnaList = [
    'Hitam',
    'Navy',
    'Maroon',
    'Coklat',
    'Abu-abu',
    'Putih',
    'Cream',
    'Dusty Pink',
    'Sage Green',
    'Mocca',
  ];

  // Create 3 variants for each product
  savedProducts.forEach((product, productIndex) => {
    for (let i = 0; i < 3; i++) {
      const ukuran =
        product.categoryId === savedCategories[2].id ||
        product.categoryId === savedCategories[3].id
          ? 'All Size'
          : ukuranList[i % ukuranList.length];

      const warna = warnaList[(productIndex * 3 + i) % warnaList.length];

      variants.push({
        productId: product.id,
        sku: `${product.slug.toUpperCase()}-${ukuran}-${warna.toUpperCase().replace(/\s/g, '-')}-${i + 1}`,
        ukuran,
        warna,
        stok: Math.floor(Math.random() * 50) + 10, // Random stock 10-60
        hargaOverride: i === 2 ? product.hargaDasar + 20000 : null, // 3rd variant has price override
        aktif: true,
      });
    }
  });

  const savedVariants = await variantRepo.save(variants);
  console.log(`✅ Created ${savedVariants.length} product variants`);

  console.log('🎉 Product Catalog Seeding Completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Categories: ${savedCategories.length}`);
  console.log(`   - Products: ${savedProducts.length}`);
  console.log(`   - Variants: ${savedVariants.length}`);
}
