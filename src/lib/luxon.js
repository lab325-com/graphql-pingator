import { DateTime } from 'luxon';

export const addIntervalToNow = (interval) => {
	const literals = interval.split(' ');
	
	if (literals.length !== 2)
		return null;
	
	try {
		const amount = parseInt(literals[0]);
		const unit = literals[1];
		
		if (isNaN(amount) || amount < 1)
			return null;
		
		return DateTime.now()
			.plus({ [unit]: amount })
			.toJSDate();
	} catch {
		return null;
	}
};