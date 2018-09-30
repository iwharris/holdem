const { randomString, randomCardString, generateArray } = require('./testhelper');
const { parseInput, rankHands } = require('../src/holdem');
const { Hand, CardSet } = require('../src/entities');
const { findHandResult } = require('../src/matchers');

jest.mock('../src/matchers');

function generateValidCommunityCardsString() {
  return generateArray(5, () => randomCardString()).join(' ');
}

function generateValidHandString() {
  return `${randomString(3)} ${generateArray(2, () => randomCardString()).join(' ')}`;
}

describe('Holdem Core', () => {
  describe('parseInput', () => {
    it('should parse community cards and hands', () => {
      const lines = generateArray(4, () => generateValidHandString());
      lines.unshift(generateValidCommunityCardsString());

      const { communityCards, hands } = parseInput(lines);

      expect(communityCards.size).toBe(5); // communityCards is a set
      expect(hands).toHaveLength(4);
    });

    it('should throw an error if there are not 5 community cards', () => {
      const lines = [
        generateArray(4, () => randomCardString()).join(' '),
        generateValidHandString(),
      ];

      expect(() => parseInput(lines)).toThrowError('5 community cards are required.');
    });
  });

  describe('rankHands', () => {
    beforeEach(() => {
      findHandResult.mockClear();
    });

    it('finds the hand result for each hand', () => {
      const numberOfHands = 4;
      const communityCards = CardSet.fromString(generateValidCommunityCardsString());
      const hands = generateArray(numberOfHands, () => generateValidHandString())
        .map(Hand.fromString);

      findHandResult.mockImplementation(() => ({ handRank: 0 }));

      const rankedHands = rankHands(communityCards, hands);

      expect(findHandResult).toBeCalledTimes(numberOfHands);
      expect(rankedHands).toHaveLength(numberOfHands);
    });
  });
});
