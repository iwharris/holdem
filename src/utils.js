const fs = require('fs');

function readArgs(argv = []) {
	return {
		isVerbose: ['--verbose', '-v'].map(f => argv.includes(f)).some(Boolean),
	};
}

function readInput() {
	const data = fs.readFileSync(0, 'utf8'); // Read data from stdin

  const lines = data.split('\n') 	// Split data on newlines
	.map(str => str.trim()) 	// Trim whitespace
  .filter(Boolean); 			// Omit empty (falsy) lines

	if (lines.length < 2) { // A minimum of 1 line of community cards and 1 hand are required
		throw new Error('At least 2 lines of input are required.');
	}

	return lines;
}

module.exports = {
  readArgs,
  readInput,
};
