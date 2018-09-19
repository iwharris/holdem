#!/usr/bin/env node

const fs = require('fs');

const { CardSet, Card, Hand } = require('./entities');

const { findHandResult } = require('./matchers');

function main() {
  const data = fs.readFileSync(0, 'utf8'); // Read data from stdin

  const lines = data.split('\n') 	// Split data on newlines
	.map(str => str.trim()) 	// Trim whitespace
  .filter(Boolean); 			// Omit empty (falsy) lines

	if (lines.length < 2) { // A minimum of 1 line of community cards and 1 hand are required
		throw new Error('At least 2 lines of input are required.');
	}

	// Print raw input
	// lines.forEach(line => console.log(line))

	const [communityCardsString, ...handStrings] = lines;

	const communityCards = CardSet.from((communityCardsString.split(' ').map(Card.fromString)));

	if (communityCards.length !== 5) {
		throw new Error('5 community cards are required.');
	}

	const hands = handStrings.map(Hand.fromString);

	console.log('Community cards:', communityCards.map(c => c.toString()).join(', '));
	hands.forEach((hand) => {
		// console.log(hand.toString());
		const combinedCards = hand.cards.concat(communityCards).sortByFaceValueDescending();
		console.log(`${hand.name} ${findHandResult(combinedCards).toString()}`);
	});
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.log(`Error: ${err.message}`);
  console.error(err);
  process.exit(1);
}
