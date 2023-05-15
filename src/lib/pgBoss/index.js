import PgBoss from 'pg-boss';
import log from '@lib/log';
import {
	PG_BOSS_POSTGRES_DB,
	PG_BOSS_POSTGRES_HOST,
	PG_BOSS_POSTGRES_PASSWORD,
	PG_BOSS_POSTGRES_PORT,
	PG_BOSS_POSTGRES_USER,
	PG_BOSS_RETRY_BACKOFF,
	PG_BOSS_SCHEMA
} from '@config/env';

const config = {
	retryBackoff: PG_BOSS_RETRY_BACKOFF,
	retentionDays: 15,
	schema: PG_BOSS_SCHEMA,
	user: PG_BOSS_POSTGRES_USER,
	password: PG_BOSS_POSTGRES_PASSWORD,
	database: PG_BOSS_POSTGRES_DB,
	host: PG_BOSS_POSTGRES_HOST,
	port: PG_BOSS_POSTGRES_PORT,
	max: 1
};

const boss = new PgBoss(config);

boss.start()
	.catch(e => {
		log.error('pg-boss connection error, details:', e);
	});

export default boss;