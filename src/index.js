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

	const communityCards = new CardSet((communityCardsString.split(' ').map(Card.fromString)));

	if (communityCards.size !== 5) {
		throw new Error('5 community cards are required.');
	}

	const hands = handStrings.map(Hand.fromString);

	console.log('Community cards:', communityCards.map(c => c.toString()).join(', '));

	// Calculate the HandResult for each Hand
	hands.forEach(hand => hand.result = findHandResult(hand.cards.union(communityCards)));

	// Sort hands by rank, breaking ties where possible
	const ranking = hands.sort((handA, handB) => handA.result.handRank - handB.result.handRank);

	// Print each ranking, player name, and hand
	ranking.forEach((hand) => {
		console.log(`${hand.result.handRank} ${hand.name} ${hand.result.toString()} [${hand.cards.union(communityCards).toString()}]`);
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
