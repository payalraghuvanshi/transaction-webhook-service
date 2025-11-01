import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { Transaction } from '../../transactions/models/transaction.model';
import { TRANSACTION_PROCESSING_JOB } from '../webhooks.service';
import { TRANSACTION_REPOSITORY } from '../../transactions/transactions.providers';

// Bull queue processor for handling transaction background jobs
@Processor('transactions')
export class TransactionProcessor {
  private readonly logger = new Logger(TransactionProcessor.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionModel: typeof Transaction,
  ) {}

  // Processes transaction job after delay and updates status to PROCESSED
  @Process(TRANSACTION_PROCESSING_JOB)
  async handleTransactionProcessing(job: Job): Promise<void> {
    const { transactionId } = job.data;
    this.logger.log(`[Job Started] Processing transaction: ${transactionId}`);

    try {
      // Simulate external API call (30-second delay)
      await new Promise(resolve => setTimeout(resolve, 30000));

      const transaction = await this.transactionModel.findOne({
        where: { transaction_id: transactionId },
      });

      if (!transaction) {
        this.logger.warn(`[Processing Warning] Transaction ${transactionId} not found in database`);
        return;
      }

      // Update status to PROCESSED with timestamp
      transaction.status = 'PROCESSED';
      transaction.processed_at = new Date();
      await transaction.save();

      this.logger.log(
        `[Processing Complete] Transaction ${transactionId} marked as PROCESSED at ${transaction.processed_at.toISOString()}`
      );
    } catch (error) {
      this.logger.error(`[Processing Error] Failed to process transaction ${transactionId}:`, error.stack);
      throw error;
    }
  }
}