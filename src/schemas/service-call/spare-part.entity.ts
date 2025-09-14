import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('spareparts')
export class SparePart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  JobID: string;

  @Column()
  Technician: number;

  @Column()
  CreatedDate: string;

  @Column()
  RequestId: string;

  @Column()
  ErpCode: string;

  @Column()
  Warehouse: string;

  @Column()
  Status: string;
}
