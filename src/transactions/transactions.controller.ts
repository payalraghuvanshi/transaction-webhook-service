import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

// Controller for querying transaction status and details
@Controller('v1/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  //Returns transaction details or 404 if not found
  @Get(':transaction_id')
  async getTransactionStatus(@Param('transaction_id') transactionId: string) {
    const transaction = await this.transactionsService.getTransactionStatus(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found.`);
    }
    return transaction;
  }
}