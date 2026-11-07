import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClassificationRecords1720000000000 implements MigrationInterface {
  name = 'ClassificationRecords1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Additive only: safe to run before the code that writes to it is deployed.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS classification_records (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id uuid NULL REFERENCES customer_requests(id) ON DELETE SET NULL,
        message text NOT NULL,
        category varchar(32) NOT NULL,
        confidence double precision NOT NULL,
        provider varchar(64) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_classification_records_category_created
      ON classification_records(category, created_at DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_classification_records_created
      ON classification_records(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS classification_records;`);
  }
}
