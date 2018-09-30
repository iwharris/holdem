const {
  Card,
  CardSet,
  Hand,
  HandResult,
} = require('../src/entities');

const { randomSuit, randomFace } = require('./testhelper');

describe('Entities', () => {
  describe('Card', () => {
    it('should set face and suit values when constructing', () => {
      const face = randomFace();
      const suit = randomSuit();

      const card = new Card(face, suit);

      expect(card.face).toBe(face);
      expect(card.suit).toBe(suit);
    });

    it('parses a valid card string into a Card object', () => {
      const face = randomFace();
      const suit = randomSuit();

      const card = Card.fromString(`${face}${suit}`);

      expect(card.face).toBe(face);
      expect(card.suit).toBe(suit);
    });

    it('should throw an error if an invalid suit is provided', () => {
      const badSuit = 'A';

      expect(() => new Card(randomFace(), badSuit)).toThrowError(`'${badSuit}' is not a valid suit`);
    });

    it('should throw an error if an invalid face is provided', () => {
      const badFace = 'D';

      expect(() => new Card(badFace, randomSuit())).toThrowError(`'${badFace}' is not a valid face`);
    });

    it('should return numeric face values', () => {
      ['2', '3', '4', '5', '6', '7', '8', '9']
        .forEach((faceValue) => {
          const card = new Card(faceValue, randomSuit());
          expect(card.getNumericFaceValue()).toBe(parseInt(faceValue, 10));
        });

      expect(new Card('T', randomSuit()).getNumericFaceValue()).toBe(10);
      expect(new Card('J', randomSuit()).getNumericFaceValue()).toBe(11);
      expect(new Card('Q', randomSuit()).getNumericFaceValue()).toBe(12);
      expect(new Card('K', randomSuit()).getNumericFaceValue()).toBe(13);
      expect(new Card('A', randomSuit()).getNumericFaceValue()).toBe(14);
    });
  });
});
