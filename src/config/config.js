import * as dotenv from 'dotenv'
dotenv.config()

const {
    DEV_POSTGRES_PASSWORD,
    DEV_POSTGRES_USER,
    DEV_POSTGRES_DB,
    DEV_POSTGRES_HOST
} = process.env;

export default {
    'local': {
        'username': DEV_POSTGRES_USER,
        'password': DEV_POSTGRES_PASSWORD,
        'database': DEV_POSTGRES_DB,
        'host': DEV_POSTGRES_HOST,
        'dialect': 'postgres',
    },
    'development': {
        'username': DEV_POSTGRES_USER,
        'password': DEV_POSTGRES_PASSWORD,
        'database': DEV_POSTGRES_DB,
        'host': DEV_POSTGRES_HOST,
        'dialect': 'postgres'
    },
    'production': {
        'username': DEV_POSTGRES_USER,
        'password': DEV_POSTGRES_PASSWORD,
        'database': DEV_POSTGRES_DB,
        'host': DEV_POSTGRES_HOST,
        'dialect': 'postgres'
    }
};