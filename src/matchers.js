const { HandResult, Card, CardSet } = require('./entities');

/**
 * Helpers
 */

function sortGroupsByFaceValue(faceGroups) {
  return Object.values(faceGroups)
    .sort((pairA, pairB) => Card.faceValueComparator(pairA[0], pairB[0])); // Sort in descending face value
}

/**
 * Matchers
 *
 * Matchers receive a CardSet as the sole input, and must return either a HandResult
 * (if a hand is found) or false/undefined (if a hand is not found).
 */

function matchRoyalFlush(cards) {
  return false;
}

function matchStraightFlush(cards) {
  return false;
}

function matchFourOfAKind(cards) {
  // Group cards into quads by face
  const faceGroups = cards.getFaceGroupsOfSize(4);

  // There should be at most one quad - if one is found, get it
  const groups = Object.values(faceGroups);

  return !groups.length ? false : HandResult.buildFourOfAKind(cards, groups[0]);
}

function matchFullHouse(cards) {
  // Get triples (may be up to 2)
  const tripleGroups = cards.getFaceGroupsOfSize(3);

  // Get the best possible full house
  const fullHouse = sortGroupsByFaceValue(tripleGroups)
    .map((triple) => {
      const remainingCards = cards.difference(new CardSet(triple)); // Make a cardSet minus the triple
      const remainingPairs = remainingCards.getFaceGroupsOfSize(2); // Look for pairs in the subset
      const bestPairArray = sortGroupsByFaceValue(remainingPairs).slice(0, 1); // Pick the highest pair

      return !bestPairArray.length ? undefined : [triple, bestPairArray[0]]; // Return [triple, pair] if pair is found, undefined otherwise
    }).find(Boolean); // Find first truthy result

  return !fullHouse ? false : HandResult.buildFullHouse(cards, fullHouse[0], fullHouse[1]);
}

function matchFlush(cards) {
  // Group by suit
  const suitGroups = cards.getGroupsBySuit();

  // Find any group with 5+ cards
  const flushGroup = Object.values(suitGroups).find(group => group.length >= 5);

  return !flushGroup ? false : HandResult.buildFlush(cards, flushGroup.sort(Card.faceValueComparator));
}

function matchStraight(cards) {
  const straight = cards.getStraight();

  return false;
}

function matchThreeOfAKind(cards) {
  // Group cards into triples by face
  const faceGroups = cards.getFaceGroupsOfSize(3);

  // Possible to get two triples; sort by face value to get the highest triple
  const faceList = sortGroupsByFaceValue(faceGroups)
    .slice(0, 1);

    return faceList.length !== 1 ? false : HandResult.buildThreeOfAKind(cards, faceList[0]);
}

function matchTwoPair(cards) {
  // Group cards into pairs by face
  const faceGroups = cards.getFaceGroupsOfSize(2);

  // Sort pairs by face value to get the highest two, returning an array containing two arrays, each with a pair of Cards.
  const faceList = sortGroupsByFaceValue(faceGroups)
    .slice(0, 2);

  return faceList.length !== 2 ? false : HandResult.buildTwoPair(cards, faceList);
}

function matchOnePair(cards) {
  // Group cards into pairs by face
  const faceGroups = cards.getFaceGroupsOfSize(2);

  // If we have gotten this far, there is a maximum of one pair - get it if one exists
  groups = Object.values(faceGroups);

  return !groups.length ? false : HandResult.buildOnePair(cards, groups[0]);
}

function matchHighCard(cards) {
  const highCards = cards.toSortedArray().slice(0, 5); // Pick the highest five cards
  return HandResult.buildHighCard(cards, highCards[0]);
}

function findHandResult(cardSet) {
  return [ // Matchers are ranked by decreasing value
    matchRoyalFlush,
    matchStraightFlush,
    matchFourOfAKind,
    matchFullHouse,
    matchFlush,
    matchStraight,
    matchThreeOfAKind,
    matchTwoPair,
    matchOnePair,
    matchHighCard, // This will always return a result
  ].reduce((foundMatch, matcher) => {
    // If we haven't found a match yet, invoke the matcher - otherwise, just return the found match
    if (!foundMatch) {
      foundMatch = matcher(cardSet);
    }
    return foundMatch;
  }, false);
}

module.exports = {
  matchRoyalFlush,
  matchStraightFlush,
  matchFourOfAKind,
  matchFullHouse,
  matchFlush,
  matchStraight,
  matchThreeOfAKind,
  matchTwoPair,
  matchOnePair,
  matchHighCard,
  findHandResult,
};
