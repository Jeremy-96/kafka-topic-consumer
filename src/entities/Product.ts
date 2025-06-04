import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  locale: string;

  @PrimaryColumn({ unique: true, type: 'varchar', length: 255 })
  product_id: string;

  @Column({ type: 'jsonb' })
  product_data: Record<string, unknown>;
}
