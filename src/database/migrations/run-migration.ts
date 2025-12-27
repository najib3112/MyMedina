import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config/database.config';

async function runMigrations() {
  const dataSource = new DataSource(databaseConfig() as any);

  try {
    await dataSource.initialize();
    console.log('✅ Database connected!');

    console.log('\n📋 Running migrations...');
    await dataSource.runMigrations();
    console.log('✅ Migrations completed successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
