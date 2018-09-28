const { CardSet, Card, Hand } = require('./entities');
const { findHandResult } = require('./matchers');

function parseInput(lines) {
	const [communityCardsString, ...handStrings] = lines;

	const communityCards = new CardSet((communityCardsString.split(' ').map(Card.fromString)));

	if (communityCards.size !== 5) {
		throw new Error('5 community cards are required.');
	}

	const hands = handStrings.map(Hand.fromString);

	return { communityCards, hands };
}

function rankHands(communityCards, hands) {
  // Calculate the HandResult for each Hand
  hands.forEach(hand => hand.result = findHandResult(hand.cards.union(communityCards)));

  // Sort hands by rank, breaking ties where possible
  return hands.sort((handA, handB) => handA.result.handRank - handB.result.handRank);
}

module.exports = {
  parseInput,
  rankHands,
};