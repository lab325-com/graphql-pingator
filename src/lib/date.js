export const addToDate = (sourceDate, number, unit) => {
	// Create a new date object to avoid modifying the sourceDate directly
	const newDate = new Date(sourceDate);
	
	// Convert number to integer to ensure proper calculation
	const parsedNumber = parseInt(number);
	
	// Normalize the unit to lowercase and singular form
	unit = unit.toLowerCase().trim();
	if (unit.endsWith('s'))
		unit = unit.slice(0, -1);
	
	// Check the unit and perform the appropriate calculation
	if (unit === 'minute')
		newDate.setTime(newDate.getTime() + (parsedNumber * 60 * 1000));
	else if (unit === 'hour')
		newDate.setTime(newDate.getTime() + (parsedNumber * 60 * 60 * 1000));
	else if (unit === 'day')
		newDate.setDate(newDate.getDate() + parsedNumber);
	else if (unit === 'week')
		newDate.setDate(newDate.getDate() + (parsedNumber * 7));
	else if (unit === 'month')
		newDate.setMonth(newDate.getMonth() + parsedNumber);
	else if (unit === 'quarter')
		newDate.setMonth(newDate.getMonth() + (parsedNumber * 3));
	else if (unit === 'year')
		newDate.setFullYear(newDate.getFullYear() + parsedNumber);
	else
		throw new Error('Invalid unit specified. Unit must be one of \'day\', \'hour\', \'minute\', \'week\', \'month\', \'quarter\', or \'year\'.');
	
	return newDate;
};

export const getHumanReadableDateDifference = (startDate, endDate) => {
	// Calculate the time difference in milliseconds
	let timeDifference = Math.abs(endDate - startDate);
	
	// Define the time units and their corresponding milliseconds
	const timeUnits = [
		{ unit: 'year', ms: 31536000000 },
		{ unit: 'month', ms: 2592000000 },
		{ unit: 'day', ms: 86400000 },
		{ unit: 'hour', ms: 3600000 },
		{ unit: 'minute', ms: 60000 },
		{ unit: 'second', ms: 1000 }
	];
	
	// Initialize an empty array to store the time difference components
	const timeComponents = [];
	
	// Loop through the time units and calculate the number of each unit
	for (let i = 0; i < timeUnits.length; i++) {
		const { unit, ms } = timeUnits[i];
		const unitCount = Math.floor(timeDifference / ms);
		
		if (unitCount > 0) {
			timeComponents.push(`${unitCount} ${unit}${unitCount > 1 ? 's' : ''}`);
			timeDifference -= unitCount * ms;
		}
	}
	
	// Join the time components into a string
	return timeComponents.join(', ');
};

export const isLaterThanNow = date => isLaterThan(date, new Date());

export const isLaterThan = (date, comparableDate) => date.getTime() > comparableDate.getTime();