import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedProductCatalog } from './product-catalog.seed';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'MyMedina',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false, // Don't auto-sync in seed script
});

async function runSeed() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected!');

    // Run seeders
    await seedProductCatalog(AppDataSource);

    console.log('✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

void runSeed();
