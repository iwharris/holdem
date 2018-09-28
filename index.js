#!/usr/bin/env node

const { readInput, readArgs } = require('./src/utils');
const { parseInput, rankHands } = require('./src/holdem');

// Read command-line arguments
const { isVerbose } = readArgs(process.argv);

function main() {
	// Read stdin
	const lines = readInput();

	// Parse game state from input
	const { communityCards, hands } = parseInput(lines);

	// If verbose mode is enabled, print the community cards
	if (isVerbose) {
		console.log('Community cards:', communityCards.map(c => c.toString()).join(', '));
	}

	// Determine each player's hand and sort them in order of hand value
	const ranking = rankHands(communityCards, hands);

	// Print each ranking, player name, and hand
	ranking.forEach((hand, index) => console.log(`${index + 1} ${hand.name} ${hand.result.toString()}${isVerbose ? ' [' + hand.cards.union(communityCards).toString() + ']' : ''}`));
}

try {
  main();
  process.exit(0);
} catch (err) {
	console.error(isVerbose ? err : `Error: ${err.message}`);
  process.exit(1);
}
