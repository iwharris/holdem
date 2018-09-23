const { HandResult } = require('./entities');

/**
 * Matchers receive a cardSet as the sole input, and must return either a HandResult
 * (if a hand is found) or false/undefined (if a hand is not found).
 */

function findRoyalFlush(cardSet) {
  return false;
}

function findStraightFlush(cardSet) {
  return false;
}

function findFourOfAKind(cardSet) {
  const faceGroups = cardSet.getGroupsByFaceValue();

  const face = Object.keys(suitGroups).find(key => faceGroups[key].length === 4);

  return !suit ? false : Handresult.buildFourOfAKind();
}

function findFullHouse(cardSet) {
  return false;
}

function findFlush(cardSet) {
  const suitGroups = cardSet.getGroupsBySuit();

  const suit = Object.keys(suitGroups).find(key => suitGroups[key].length === 5);
  const cards = suitGroups[suit];
  // return matchingKey ? suitGroups[matchingKey] : false;
  console.log('suitGroups', suitGroups)
  return !suit ? false : HandResult.buildFlush(cards); // Cards are sorted in ascending face order
}

function findStraight(cardSet) {
  return false;
}

function findThreeOfAKind(cardSet) {
  return false;
}

function findTwoPair(cardSet) {
  return false;
}

function findOnePair(cardSet) {
  return false;
}

function findHighCard(cardSet) {
  const sortedCards = cardSet.slice(0, 5); // Pick the highest five cards

  return HandResult.buildHighCard(sortedCards);
}

function findHandResult(cardSet) {
  return [ // Matchers are ranked by decreasing value
    findRoyalFlush,
    findStraightFlush,
    findFourOfAKind,
    findFullHouse,
    findFlush,
    findStraight,
    findThreeOfAKind,
    findTwoPair,
    findOnePair,
    findHighCard, // This will always return a result
  ].reduce((foundMatch, matcher, index) => {
    // If we haven't found a match yet, invoke the matcher - otherwise, just return the found match
    if (!foundMatch) {
      foundMatch = matcher(cardSet);
      if (foundMatch) {
        foundMatch.handRank = index; // Inject hand index into match (used for ranking hands)
      }
    }
    return foundMatch;
  }, false);
}

module.exports = {
  findRoyalFlush,
  findStraightFlush,
  findFourOfAKind,
  findFullHouse,
  findFlush,
  findStraight,
  findThreeOfAKind,
  findTwoPair,
  findOnePair,
  findHighCard,
  findHandResult,
};
