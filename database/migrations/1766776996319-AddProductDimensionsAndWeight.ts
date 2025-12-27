import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductDimensionsAndWeight1766776996319 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add columns if they don't exist
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN IF NOT EXISTS "length" numeric(8,2) DEFAULT 20.00,
            ADD COLUMN IF NOT EXISTS "width" numeric(8,2) DEFAULT 15.00,
            ADD COLUMN IF NOT EXISTS "height" numeric(8,2) DEFAULT 10.00
        `);
        
        // Update null values with defaults
        await queryRunner.query(`
            UPDATE "products"
            SET "length" = COALESCE("length", 20.00),
                "width" = COALESCE("width", 15.00),
                "height" = COALESCE("height", 10.00)
            WHERE "length" IS NULL OR "width" IS NULL OR "height" IS NULL
        `);
        
        // Add NOT NULL constraints
        await queryRunner.query(`
            ALTER TABLE "products"
            ALTER COLUMN "length" SET NOT NULL,
            ALTER COLUMN "width" SET NOT NULL,
            ALTER COLUMN "height" SET NOT NULL
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
