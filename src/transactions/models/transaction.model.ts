import { Table, Column, Model, DataType, PrimaryKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';

// Transaction model for storing webhook transaction data
@Table({
  tableName: 'transactions',
  timestamps: true,
  comment: 'Stores transaction data received from payment processor webhooks',
})
export class Transaction extends Model<Transaction> {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    allowNull: false,
    comment: 'Auto-incrementing primary key',
  })
  id: number;

  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    comment: 'Unique UUID for external reference',
  })
  uuid: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Unique transaction ID from payment processor',
  })
  transaction_id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Source account identifier (payer)',
  })
  source_account: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Destination account identifier (payee)',
  })
  destination_account: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Transaction amount with 2 decimal precision',
  })
  amount: number;

  @Column({
    type: DataType.STRING(3),
    allowNull: false,
    comment: 'Currency code (ISO 4217)',
  })
  currency: string;

  @Column({
    type: DataType.ENUM('PROCESSING', 'PROCESSED'),
    allowNull: false,
    defaultValue: 'PROCESSING',
    comment: 'Current processing status of the transaction',
  })
  status: 'PROCESSING' | 'PROCESSED';

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Timestamp when the transaction was created',
  })
  created_at: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Timestamp when the transaction was last updated',
  })
  updated_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Timestamp when processing completed (null if still processing)',
  })
  processed_at: Date | null;
}