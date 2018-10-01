const { findHandResult } = require('../src/matchers');

const { Card, CardSet, HandResult } = require('../src/entities');

const { randomFace, randomSuit, randomCard } = require('./testhelper');

describe('Matchers', () => {
  describe('Royal Flush', () => {
    it('should detect a royal flush when present', () => {
      const suit = randomSuit();
      const cards = [
        new Card('T', suit),
        new Card('Q', suit),
        new Card('J', suit),
        new Card('A', suit),
        new Card('K', suit),
        randomCard(),
        randomCard(),
      ];
      const suitName = cards[0].getSuit();

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Royal Flush');
      expect(handResult.getHandResultString()).toBe(suitName);
    });
  });

  describe('Straight Flush', () => {
    it('should detect a straight flush when present', () => {
      const suit = randomSuit();
      const cards = [
        new Card('2', suit),
        new Card('4', suit),
        new Card('5', suit),
        new Card('3', suit),
        new Card('6', suit),
        new Card('T', randomSuit()),
        new Card('K', randomSuit()),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Straight Flush');
      expect(handResult.getHandResultString()).toBe('6');
    });

    it('should detect a straight flush (ace low)', () => {
      const suit = randomSuit();
      const cards = [
        new Card('2', suit),
        new Card('4', suit),
        new Card('5', suit),
        new Card('3', suit),
        new Card('A', suit),
        new Card('9', randomSuit()),
        new Card('7', randomSuit()),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Straight Flush');
      expect(handResult.getHandResultString()).toBe('5');
    });

    it('should detect the highest possible straight flush if a straight is > 5 cards', () => {
      const suit = randomSuit();
      const cards = [
        new Card('2', suit),
        new Card('4', suit),
        new Card('5', suit),
        new Card('3', suit),
        new Card('6', suit),
        new Card('8', suit),
        new Card('7', suit),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Straight Flush');
      expect(handResult.getHandResultString()).toBe('8');
    });
  });

  describe('Four of a Kind', () => {
    it('should detect a four of a kind when present', () => {
      const face = randomFace();
      const cards = [
        new Card(face, 'D'),
        new Card(face, 'H'),
        new Card(face, 'C'),
        new Card(face, 'S'),
        randomCard(),
        randomCard(),
        randomCard(),
      ];
      const faceName = cards[0].getFaceName();

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Four of a Kind');
      expect(handResult.getHandResultString()).toBe(faceName);
    });
  });

  describe('Full House', () => {
    it('should detect a full house when present', () => {
      const cards = [
        new Card('T', 'D'),
        new Card('T', 'H'),
        new Card('T', 'C'),
        new Card('3', 'S'),
        new Card('3', 'D'),
        new Card('6', 'S'),
        new Card('9', 'C'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Full House');
      expect(handResult.getHandResultString()).toBe('Ten 3');
    });

    it('should pick the highest available triple', () => {
      const cards = [
        new Card('T', 'D'),
        new Card('T', 'H'),
        new Card('T', 'C'),
        new Card('J', 'S'),
        new Card('J', 'D'),
        new Card('J', 'S'),
        new Card('9', 'C'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Full House');
      expect(handResult.getHandResultString()).toBe('Jack Ten');
    });

    it('should pick the highest available double', () => {
      const cards = [
        new Card('T', 'D'),
        new Card('T', 'H'),
        new Card('T', 'C'),
        new Card('2', 'S'),
        new Card('2', 'D'),
        new Card('3', 'S'),
        new Card('3', 'C'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Full House');
      expect(handResult.getHandResultString()).toBe('Ten 3');
    });
  });

  describe('Flush', () => {
    it('should detect a flush when present', () => {
      const suit = randomSuit();
      const cards = [
        new Card('2', suit),
        new Card('A', suit),
        new Card('T', suit),
        new Card('K', suit),
        new Card('9', suit),
        new Card('3', randomSuit()),
        new Card('K', randomSuit()),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Flush');
      expect(handResult.getHandResultString()).toBe('Ace');
    });
  });

  describe('Straight', () => {
    it('should detect a straight when present', () => {
      const cards = [
        new Card('4', 'S'),
        new Card('6', 'C'),
        new Card('5', 'D'),
        new Card('8', 'H'),
        new Card('7', 'S'),
        new Card('T', 'H'),
        new Card('K', 'C'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Straight');
      expect(handResult.getHandResultString()).toBe('8');
    });

    it('should detect a straight (ace low)', () => {
      const cards = [
        new Card('3', 'S'),
        new Card('2', 'C'),
        new Card('A', 'D'),
        new Card('4', 'H'),
        new Card('7', 'S'),
        new Card('5', 'H'),
        new Card('K', 'C'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Straight');
      expect(handResult.getHandResultString()).toBe('5');
    });
  });

  describe('Three of a Kind', () => {
    it('should detect a three of a kind when present', () => {
      const cards = [
        new Card('3', 'D'),
        new Card('6', 'S'),
        new Card('J', 'D'),
        new Card('3', 'S'),
        new Card('9', 'C'),
        new Card('3', 'H'),
        new Card('A', 'H'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Three of a Kind');
      expect(handResult.getHandResultString()).toBe('3');
    });
  });

  describe('Two Pair', () => {
    it('should detect a two pair when present', () => {
      const cards = [
        new Card('3', 'D'),
        new Card('6', 'S'),
        new Card('J', 'D'),
        new Card('3', 'S'),
        new Card('9', 'C'),
        new Card('4', 'H'),
        new Card('4', 'H'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Two Pair');
      expect(handResult.getHandResultString()).toBe('4 3');
    });

    it('should pick the highest two pairs if three pairs are present', () => {
      const cards = [
        new Card('3', 'D'),
        new Card('6', 'S'),
        new Card('J', 'D'),
        new Card('3', 'S'),
        new Card('J', 'C'),
        new Card('4', 'H'),
        new Card('4', 'H'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Two Pair');
      expect(handResult.getHandResultString()).toBe('Jack 4');
    });
  });

  describe('Pair', () => {
    it('should detect a pair when present', () => {
      const cards = [
        new Card('3', 'D'),
        new Card('6', 'S'),
        new Card('J', 'D'),
        new Card('3', 'S'),
        new Card('A', 'C'),
        new Card('4', 'H'),
        new Card('Q', 'H'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('Pair');
      expect(handResult.getHandResultString()).toBe('3');
    });
  });

  describe('High Card', () => {
    it('should detect a high card', () => {
      const cards = [
        new Card('3', 'D'),
        new Card('6', 'S'),
        new Card('J', 'D'),
        new Card('4', 'S'),
        new Card('9', 'C'),
        new Card('2', 'H'),
        new Card('T', 'H'),
      ];

      const cardSet = new CardSet(cards);

      const handResult = findHandResult(cardSet);

      expect(handResult).toBeInstanceOf(HandResult);
      expect(handResult.name).toBe('High');
      expect(handResult.getHandResultString()).toBe('Jack');
    });
  });
});
