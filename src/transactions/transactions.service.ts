import { Injectable, HttpException, HttpStatus, Logger, NotFoundException, Inject } from '@nestjs/common';
import { Transaction } from './models/transaction.model';
import { TRANSACTION_REPOSITORY } from './transactions.providers';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionModel: typeof Transaction,
  ) {
    this.logger.log('TransactionsService initialized successfully');
  }

  // Retrieves transaction status by ID
  async getTransactionStatus(transactionId: string): Promise<Transaction | null> {
    try {
      this.logger.log(`[Query] Fetching transaction: ${transactionId}`);

      const transaction = await this.transactionModel.findOne({
        where: { transaction_id: transactionId },
        attributes: { exclude: ['id'] },
      });

      if (transaction) {
        this.logger.log(
          `[Query Success] Transaction ${transactionId} found with status: ${transaction.status}`
        );
      } else {
        this.logger.warn(`[Query Warning] Transaction ${transactionId} not found`);
      }

      return transaction;
    } catch (error) {
      this.logger.error(
        `[Query Error] Failed to retrieve transaction ${transactionId}:`,
        error.stack
      );
      throw new HttpException(
        'Failed to retrieve transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves all transactions with optional status and date filtering
  async findAll(filters?: {
    status?: 'PROCESSING' | 'PROCESSED';
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    try {
      this.logger.log('[Query] Fetching all transactions with filters:', filters);

      const where: any = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.startDate || filters?.endDate) {
        where.created_at = {};
        if (filters.startDate) {
          where.created_at.$gte = filters.startDate;
        }
        if (filters.endDate) {
          where.created_at.$lte = filters.endDate;
        }
      }

      const transactions = await this.transactionModel.findAll({
        where,
        order: [['created_at', 'DESC']],
        attributes: { exclude: ['id'] },
      });

      this.logger.log(`[Query Success] Retrieved ${transactions.length} transactions`);

      return transactions;
    } catch (error) {
      this.logger.error('[Query Error] Failed to retrieve transactions:', error.stack);
      throw new HttpException(
        'Failed to retrieve transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}