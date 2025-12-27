import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveProductWeightColumn1735292100000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products"
            DROP COLUMN IF EXISTS "weight"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD COLUMN "weight" integer DEFAULT 500
        `);
    }

}
