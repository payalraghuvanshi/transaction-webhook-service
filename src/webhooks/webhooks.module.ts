import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { TransactionProcessor } from './processors/transaction.processor';
import { DatabaseModule } from '../database/database.module';
import { transactionProviders } from '../transactions/transactions.providers';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'transactions',
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, TransactionProcessor, ...transactionProviders],
})
export class WebhooksModule {}