const { CardSet, Hand } = require('./entities');
const { findHandResult } = require('./matchers');

function parseInput(lines) {
  const [communityCardsString, ...handStrings] = lines;

  // const communityCards = new CardSet(communityCardsString.split(' ').map(Card.fromString));
  const communityCards = CardSet.fromString(communityCardsString);

  if (communityCards.size !== 5) {
    throw new Error('5 community cards are required.');
  }

  const hands = handStrings.map(Hand.fromString);

  return { communityCards, hands };
}

function rankHands(communityCards, hands) {
  return hands
    // Calculate the HandResult for each Hand
    .map(hand => Object.assign(hand, { result: findHandResult(hand.cards.union(communityCards)) }))
    // Sort hands by rank, breaking ties where possible
    .sort((handA, handB) => handA.result.handRank - handB.result.handRank);
}

module.exports = {
  parseInput,
  rankHands,
};
