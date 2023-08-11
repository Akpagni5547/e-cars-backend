import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('file')
class DatabaseFile {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  filename: string;

  @Column({
    type: 'blob',
  })
  data: Uint8Array;
}

export default DatabaseFile;
