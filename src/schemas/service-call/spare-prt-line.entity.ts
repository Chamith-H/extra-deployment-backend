import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sparepartlines')
export class SparePartLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  RequestId: string;

  @Column()
  ItemCode: string;

  @Column()
  ItemName: string;

  @Column()
  Quantity: string;

  @Column()
  Consume: string;
}
