import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { TransactionWebhookDto } from './dto/transaction-webhook.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Transaction } from '../transactions/models/transaction.model';
import { TRANSACTION_REPOSITORY } from '../transactions/transactions.providers';

export const TRANSACTION_PROCESSING_JOB = 'processTransaction';

// Service for handling incoming webhooks with idempotency and background processing
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectQueue('transactions') private readonly transactionQueue: Queue,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionModel: typeof Transaction,
  ) {
    this.logger.log('WebhooksService initialized successfully');
  }

  // Handles webhook payload with idempotency check and schedules background processing
  async handleWebhook(payload: TransactionWebhookDto): Promise<void> {
    this.logger.log(`[Webhook Received] Transaction ID: ${payload.transaction_id}`);

    try {
      // Check for duplicate transactions (idempotency)
      const existingTransaction = await this.transactionModel.findOne({
        where: { transaction_id: payload.transaction_id },
        attributes: ['transaction_id', 'status'],
      });

      if (existingTransaction) {
        this.logger.warn(
          `[Idempotency] Transaction ${payload.transaction_id} already exists with status: ${existingTransaction.status}. Skipping.`
        );
        return;
      }

      // Create transaction record with PROCESSING status
      const newTransaction = await this.transactionModel.create({
        transaction_id: payload.transaction_id,
        source_account: payload.source_account,
        destination_account: payload.destination_account,
        amount: payload.amount,
        currency: payload.currency,
        status: 'PROCESSING' as const,
        processed_at: null,
      } as any);

      this.logger.log(
        `[Transaction Created] ID: ${newTransaction.transaction_id}, Amount: ${newTransaction.amount} ${newTransaction.currency}`
      );

      // Schedule background job with 30-second delay
      await this.transactionQueue.add(
        TRANSACTION_PROCESSING_JOB,
        { transactionId: payload.transaction_id },
        { delay: 30000 },
      );

      this.logger.log(`[Job Scheduled] Transaction ${payload.transaction_id} queued for processing`);
    } catch (error) {
      this.logger.error(
        `[Webhook Error] Failed to handle webhook for transaction ${payload.transaction_id}:`,
        error.stack
      );
      throw new HttpException(
        'Failed to process webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves transaction by ID
  async getTransaction(transactionId: string): Promise<Transaction | null> {
    try {
      return await this.transactionModel.findOne({
        where: { transaction_id: transactionId },
      });
    } catch (error) {
      this.logger.error(`[Query Error] Failed to retrieve transaction ${transactionId}:`, error.stack);
      throw new HttpException(
        'Failed to retrieve transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}