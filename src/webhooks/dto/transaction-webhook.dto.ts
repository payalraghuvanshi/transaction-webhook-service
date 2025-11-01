import { IsString, IsNumber, IsNotEmpty, Min, MaxLength, Matches } from 'class-validator';

// DTO for validating incoming transaction webhook payloads
export class TransactionWebhookDto {
  @IsString({ message: 'Transaction ID must be a string' })
  @IsNotEmpty({ message: 'Transaction ID is required' })
  @MaxLength(255, { message: 'Transaction ID must not exceed 255 characters' })
  transaction_id: string;

  @IsString({ message: 'Source account must be a string' })
  @IsNotEmpty({ message: 'Source account is required' })
  @MaxLength(255, { message: 'Source account must not exceed 255 characters' })
  source_account: string;

  @IsString({ message: 'Destination account must be a string' })
  @IsNotEmpty({ message: 'Destination account is required' })
  @MaxLength(255, { message: 'Destination account must not exceed 255 characters' })
  destination_account: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency is required' })
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a 3-letter ISO 4217 code (e.g., INR, USD)' })
  currency: string;
}