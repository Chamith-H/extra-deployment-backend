import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('access')
export class Access {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  module: string;

  @Column()
  section: string;

  @Column()
  name: string;

  @Column()
  checker: number;
}
