const fs = require('fs');

const lines = fs.readFileSync('.env', { encoding: 'utf8' }).split('\n');
const exampleEnv = lines.map(e => {
	const equalsIndex = e.indexOf('=');
	return equalsIndex > 0 ? e.substring(0, equalsIndex + 1) : e;
}).join('\n');

fs.writeFileSync('.env.example', exampleEnv);
