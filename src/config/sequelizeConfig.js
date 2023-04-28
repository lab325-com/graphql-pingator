require('dotenv').config()

// TODO: rename secrets to
/*
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
POSTGRES_HOST
POSTGRES_PORT
 */

const {
    DEV_POSTGRES_PASSWORD,
    DEV_POSTGRES_USER,
    DEV_POSTGRES_DB,
    DEV_POSTGRES_HOST,
} = process.env;

module.exports = {
    'local': {
        'username': DEV_POSTGRES_USER,
        'password': DEV_POSTGRES_PASSWORD,
        'database': DEV_POSTGRES_DB,
        'host': DEV_POSTGRES_HOST,
        'ssl': false,
        'dialect': 'postgres',
    },
    'development': {
        'username': DEV_POSTGRES_USER,
        'password': DEV_POSTGRES_PASSWORD,
        'database': DEV_POSTGRES_DB,
        'host': DEV_POSTGRES_HOST,
        'ssl': false,
        'dialect': 'postgres'
    },
    'production': {
        'username': DEV_POSTGRES_USER,
        'password': DEV_POSTGRES_PASSWORD,
        'database': DEV_POSTGRES_DB,
        'host': DEV_POSTGRES_HOST,
        'ssl': false,
        'dialect': 'postgres'
    }
};