import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'MOCK_DATA',
  timestamps: true,
})
export class MockData extends Model<MockData> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  account: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  ind_dc: string;

  @Column({
    type: DataType.DECIMAL(6, 2),
    allowNull: false,
  })
  value: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;
}