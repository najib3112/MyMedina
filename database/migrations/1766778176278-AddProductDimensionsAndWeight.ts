import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductDimensionsAndWeight1766778176278 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration handles cleanup of the first incomplete migration
        // Drop columns if they exist
        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN IF EXISTS "length" CASCADE,
            DROP COLUMN IF EXISTS "width" CASCADE,
            DROP COLUMN IF EXISTS "height" CASCADE,
            DROP COLUMN IF EXISTS "weight" CASCADE
        `);
        
        // Add columns fresh with defaults and NOT NULL
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN "length" numeric(8,2) NOT NULL DEFAULT 20.00,
            ADD COLUMN "width" numeric(8,2) NOT NULL DEFAULT 15.00,
            ADD COLUMN "height" numeric(8,2) NOT NULL DEFAULT 10.00
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN IF EXISTS "length",
            DROP COLUMN IF EXISTS "width",
            DROP COLUMN IF EXISTS "height"
        `);
    }

}
