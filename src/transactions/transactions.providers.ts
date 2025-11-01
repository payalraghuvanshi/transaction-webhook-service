import { Transaction } from './models/transaction.model';

// Provides Transaction model for dependency injection
export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';

export const transactionProviders = [
  {
    provide: TRANSACTION_REPOSITORY,
    useValue: Transaction,
  },
];