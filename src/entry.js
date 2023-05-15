require('dotenv').config();

const { ESLint } = require('eslint');

lint()
	.then(lintErrors => {
		if (lintErrors && !(process.env.NODE_ENV !== 'local' || process.env.NODE_ENV !== 'development'))
			throw new Error('MAKE AN EFFORT TO FIX LINTER ERRORS, BITCH!!!');
	})
	.then(async () => await import(`./app.js`))
	.catch(console.error);

async function lint() {
	if (process.env.DISABLE_LINT) return null;
	
	const eslint = new ESLint({ fix: true });
	
	const results = await eslint.lintFiles(['src/**/*.js', 'src/**/*.js']);
	
	await ESLint.outputFixes(results);
	
	const formatter = await eslint.loadFormatter('stylish');
	const resultText = formatter.format(results);
	console.log(resultText);
	return resultText;
}