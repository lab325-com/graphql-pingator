function addToDate(sourceDate, number, unit) {
    // Create a new date object to avoid modifying the sourceDate directly
    const newDate = new Date(sourceDate);

    // Convert number to integer to ensure proper calculation
    const parsedNumber = parseInt(number);

    // Normalize the unit to lowercase and singular form
    unit = unit.toLowerCase().trim();
    if (unit.endsWith("s")) {
        unit = unit.slice(0, -1);
    }

    // Check the unit and perform the appropriate calculation
    if (unit === "second") {
        newDate.setTime(newDate.getTime() + (parsedNumber * 1000));
    } else if (unit === "minute") {
        newDate.setTime(newDate.getTime() + (parsedNumber * 60 * 1000));
    } else if (unit === "hour") {
        newDate.setTime(newDate.getTime() + (parsedNumber * 60 * 60 * 1000));
    } else if (unit === "day") {
        newDate.setDate(newDate.getDate() + parsedNumber);
    } else if (unit === "week") {
        newDate.setDate(newDate.getDate() + (parsedNumber * 7));
    } else if (unit === "month") {
        newDate.setMonth(newDate.getMonth() + parsedNumber);
    } else if (unit === "quarter") {
        newDate.setMonth(newDate.getMonth() + (parsedNumber * 3));
    } else if (unit === "year") {
        newDate.setFullYear(newDate.getFullYear() + parsedNumber);
    } else {
        throw new Error("Invalid unit specified. Unit must be one of 'day', 'hour', 'minute', 'second', 'week', 'month', 'quarter', or 'year'.");
    }

    return newDate;
}

module.exports = { addToDate }