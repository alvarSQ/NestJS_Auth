import {
  Column,
  Model,
  Table,
  DataType,
  BeforeCreate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

@Table({ tableName: 'users' })
export class UserEntity extends Model<UserEntity> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  login: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  tabel: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @BeforeCreate
  static async hashPassword(instance: UserEntity) {
    if (instance.password) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }
}
