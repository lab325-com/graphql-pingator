import pgBoss from '@lib/pgBoss';
import log from '@lib/log';

/* const config = {

}; */

export default async () => {
	log.info(await pgBoss.getSchedules())
}