const { randomString, randomCardString, generateArray } = require('./testhelper');
const { parseInput, rankHands, getOutput } = require('../../src/holdem');
const { Hand, CardSet } = require('../../src/entities');
const { findHandResult } = require('../../src/matchers');

jest.mock('../../src/matchers');

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

      findHandResult.mockImplementation(() => ({ handRank: 0, comparator: jest.fn(() => 0) }));

      const rankedHands = rankHands(communityCards, hands);

      expect(findHandResult).toBeCalledTimes(numberOfHands);
      expect(rankedHands).toHaveLength(numberOfHands);
    });
  });

  describe('getOutput', () => {
    it('invokes toString() on each handResult', () => {
      const hand1 = Hand.fromString('foo AC KH');
      hand1.name = 'Hand1';
      hand1.handRank = 1;
      hand1.result = { rank: 1, toString: jest.fn(() => 'Result1') };

      const hand2 = Hand.fromString('bar 2S 2D');
      hand2.name = 'Hand2';
      hand2.handRank = 2;
      hand2.result = { rank: 2, toString: jest.fn(() => 'Result2') };

      const output = getOutput([hand1, hand2], false);

      expect(output).toHaveLength(2);
      expect(output).toEqual(expect.arrayContaining([
        '1 Hand1 Result1',
        '2 Hand2 Result2',
      ]));
      expect(hand1.result.toString).toHaveBeenCalledTimes(1);
      expect(hand2.result.toString).toHaveBeenCalledTimes(1);
    });

    it('invokes the cards.toString() function when verbose mode is enabled', () => {
      const resultToStringMock = jest.fn();
      const cardsToStringMock = jest.fn();

      const numberOfHands = 3;

      const rankings = generateArray(numberOfHands, idx => ({
        name: randomString(),
        cards: { toString: cardsToStringMock },
        handRank: idx,
        result: { toString: resultToStringMock },
      }));

      const output = getOutput(rankings, true);

      expect(output).toHaveLength(numberOfHands);
      expect(resultToStringMock).toHaveBeenCalledTimes(numberOfHands);
      expect(cardsToStringMock).toHaveBeenCalledTimes(numberOfHands);
    });
  });
});
