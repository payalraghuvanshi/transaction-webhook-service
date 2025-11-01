import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

// Provides database connectivity via Sequelize
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {
}