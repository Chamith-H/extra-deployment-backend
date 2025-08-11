import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notificationt')
export class NotificationT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  EmployeeID: string;

  @Column()
  Token: string;
}
