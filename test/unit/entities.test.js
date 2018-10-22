const {
  Card,
  CardSet,
  Hand,
  HandResult,
} = require('../../src/entities');

const {
  randomSuit,
  randomFace,
  randomCard,
  generateArray,
  randomString,
} = require('./testhelper');

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

    it('should sort in order of descending face value', () => {
      const cards = [
        new Card('2', randomSuit()),
        new Card('K', randomSuit()),
        new Card('A', randomSuit()),
        new Card('T', randomSuit()),
      ];

      const sortedCards = cards.sort(Card.faceValueComparator);

      expect(sortedCards).toHaveLength(4);
      expect(sortedCards.map(card => card.face)).toEqual(['A', 'K', 'T', '2']);
    });

    it('should handle the special case when detecting straights where A can be low or high', () => {
      const two = new Card('2', randomSuit());
      const king = new Card('K', randomSuit());
      const ace = new Card('A', randomSuit());

      expect(ace.isImmediatelyAfter(two)).toBeTruthy();
      expect(king.isImmediatelyAfter(ace)).toBeTruthy();
    });
  });

  describe('Hand', () => {
    it('should accept a name and two cards in the constructor', () => {
      const cards = generateArray(2, randomCard);

      const name = randomString();

      const hand = new Hand(name, cards);

      expect(hand.name).toBe(name);
      expect(hand.cards.size).toBe(2);
      expect(hand.cards).toContainEqual(cards[0]);
      expect(hand.cards).toContainEqual(cards[1]);
    });

    it('should throw an error if constructing without two cards', () => {
      const name = randomString();

      expect(() => new Hand(name)).toThrowError(`Player '${name}' must have two cards!`);
    });

    it('should return a Hand when parsing a valid string', () => {
      const name = randomString();
      const face1 = randomFace();
      const suit1 = randomSuit();
      const face2 = randomFace();
      const suit2 = randomSuit();

      const handString = `${name} ${face1}${suit1} ${face2}${suit2}`;

      const hand = Hand.fromString(handString);

      expect(hand.name).toBe(name);
      expect(hand.cards).toContainEqual(new Card(face1, suit1));
      expect(hand.cards).toContainEqual(new Card(face2, suit2));
    });
  });

  describe('HandResult', () => {
    it('should construct a HandResult with any object input', () => {
      const options = {
        foo: 'bar',
        baz: [],
        fooFunc: () => 'foo',
      };

      const handResult = new HandResult(options);

      expect(handResult).toMatchObject(options); // HandResult contains all passed option values
    });

    it('should call the provided getHandResultString() function when building a string', () => {
      const options = {
        name: randomString(),
        getHandResultString: jest.fn(() => 'foo'),
      };

      const handResult = new HandResult(options);
      const string = handResult.toString();

      expect(handResult.getHandResultString).toHaveBeenCalledTimes(1);
      expect(string).toBe(`${options.name} foo`);
    });
  });

  describe('CardSet', () => {
    it('should format its values in a string in descending order', () => {
      const cardSet = new CardSet([
        new Card('A', 'D'),
        new Card('6', 'S'),
        new Card('K', 'H'),
        new Card('2', 'C'),
      ]);

      expect(cardSet.toString()).toBe('[AD, KH, 6S, 2C]');
    });
  });
});
