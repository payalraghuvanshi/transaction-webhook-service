// Database configuration interface for multiple environments
export interface IDatabaseConfigAttributes {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: string | number;
  dialect?: string;
  urlDatabase?: string;
  logging?: boolean | Function;
  pool?: {
    max?: number;
    min?: number;
    acquire?: number;
    idle?: number;
  };
}

export interface IDatabaseConfig {
  development: IDatabaseConfigAttributes;
  test: IDatabaseConfigAttributes;
  production: IDatabaseConfigAttributes;
}

