import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from 'src/core/common/constants';
import { databaseConfig } from './config/database.config';
import { Transaction } from 'src/transactions/models/transaction.model';

// Configures Sequelize ORM with PostgreSQL based on environment
export let sequelize: Sequelize;

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config: any;

      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }

      sequelize = new Sequelize({
        dialect: config.dialect as any,
        host: config.host,
        port: Number(config.port),
        username: config.username,
        password: config.password,
        database: config.database,
        define: {
          freezeTableName: true,
          underscored: false,
        },
        logging: config.logging,
        pool: config.pool,
        repositoryMode: false,
      });

      sequelize.addModels([Transaction]);
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      return sequelize;
    },
  },
];