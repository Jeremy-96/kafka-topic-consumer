import 'dotenv/config';
import 'reflect-metadata';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DataSource } from 'typeorm';
import { Product } from '../entities/Product';

const port = process.env.DB_PORT as number | undefined;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: port,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Product],
  migrations: [`${__dirname}/**/migrations/*.{ts,js}`],
  synchronize: true,
});
