import { config } from 'dotenv';
config()

import {
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_DB,
  POSTGRES_HOST
} from '@config/env'

const pgConfig = {
  'username': POSTGRES_USER,
  'password': POSTGRES_PASSWORD,
  'database': POSTGRES_DB,
  'host': POSTGRES_HOST,
  'dialect': 'postgres',
}

export default {
    local: pgConfig,
    development: {
        ssl: false,
        ...pgConfig,
    },
    production: pgConfig
};