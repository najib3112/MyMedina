import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductDimensions1735379400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename columns to Indonesian names
    await queryRunner.renameColumn('products', 'weight', 'berat');
    await queryRunner.renameColumn('products', 'length', 'panjang');
    await queryRunner.renameColumn('products', 'width', 'lebar');
    await queryRunner.renameColumn('products', 'height', 'tinggi');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback changes
    await queryRunner.renameColumn('products', 'berat', 'weight');
    await queryRunner.renameColumn('products', 'panjang', 'length');
    await queryRunner.renameColumn('products', 'lebar', 'width');
    await queryRunner.renameColumn('products', 'tinggi', 'height');
  }
}
