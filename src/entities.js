const {
  FACE_VALUES,
  FACE_VALUE_NAMES,
  SUITS,
  SUIT_NAMES,
} = require('./constants');

/**
 * Card is a simple class that stores the following state:
 *
 * - face value
 * - suit
 *
 * Along with convenience functions for comparing Cards and converting
 * its state into a human-readable form.
 */
class Card {
  constructor(face, suit) {
    if (!SUITS.includes(suit)) {
      throw new Error(`'${suit}' is not a valid suit`);
    }

    if (!FACE_VALUES.includes(face)) {
      throw new Error(`'${face}' is not a valid face'`);
    }
    this.face = face;
    this.suit = suit;
  }

  /**
   * Gets the numeric face value of this Card, with higher being more valuable.
   * Numeric cards get a value equal to their face value, eg. "3"'s value is 3.
   * Face cards (incl. ten) get a value counting up accordingly, eg. "T" = 10, "K" = 13
   */
  getNumericFaceValue() {
    return FACE_VALUES.findIndex(v => v === this.face) + 2;
  }

  /**
   * Gets a human-readable face value name from this Card.
   * Numeric values (except for ten) are returned as a number, eg. "3" or "9".
   * Face values (including ten) are returned as a word, eg. "Ten" or "Ace".
   */
  getFaceName() {
    return FACE_VALUE_NAMES[this.face] || this.face;
  }

  /**
   * Gets a human-readable suit name from this Card.
   */
  getSuit() {
    return SUIT_NAMES[this.suit];
  }

  /**
   * Convenience function that is used when detecting straights. A card is immediately after
   * another if its value is 1 below previousCard's value. This function accounts for the special
   * case where aces can be low in a straight or straight flush.
   * @param {Card} previousCard
   */
  isImmediatelyAfter(previousCard) {
    return (previousCard.getNumericFaceValue() - this.getNumericFaceValue() === 1) || (previousCard.face === '2' && this.face === 'A');
  }

  /**
   * Comparator function which compares the face value of two Cards, giving precedence
   * to the card with a higher face value.
   */
  static faceValueComparator(cardA, cardB) {
    return cardB.getNumericFaceValue() - cardA.getNumericFaceValue();
  }

  /**
   * Factory function. Returns a new Card instance based on an encoded string of the form
   * <FACE_VALUE><SUIT>. For example, King of Diamonds would be "KD".
   *
   * @param {string} cardString
   */
  static fromString(cardString) {
    const [value, suit] = cardString;
    return new Card(value, suit);
  }
}

/**
 * CardSet is a representation of some Cards using Set semantics. It offers some useful
 * functionality:
 *
 * - De-duplication of cards
 * - Easy membership checks
 * - Union/difference operations with other CardSets.
 *
 * It also contains many convenience functions that aid in detecting HandResults for a set of
 * cards.
 */
class CardSet extends Set {
  /**
   * Included for convenience. Generates a sorted array of Cards (in descending face value)
   * from this Set and then applies map() on the array.
   *
   * @param {Function} mapFunc
   */
  map(mapFunc) {
    return this.toSortedArray().map(mapFunc);
  }

  /* Set operations */

  /**
   * Given another Cardset, returns a new CardSet that represents the union of this CardSet
   * and the other CardSet (ie. all elements of both CardSets without duplicates).
   *
   * @param {CardSet} otherSet
   */
  union(otherSet) {
    return new CardSet([...this, ...otherSet]);
  }

  /**
   * Given another CardSet, returns a new CardSet that represents the difference of this CardSet
   * and the other CardSet (ie. the elements of this CardSet minus the elements in otherSet).
   *
   * @param {CardSet} otherSet
   */
  difference(otherSet) {
    return new CardSet([...this].filter(card => !otherSet.has(card)));
  }

  /* Conversions */

  /**
   * Groups cards in this CardSet into "buckets" based on suit or face. This function
   * is used when detecting certain hands or combinations of cards.
   *
   * @param {String} groupProperty either "suit" or "face"
   */
  getGroupsBy(groupProperty) {
    return this.toSortedArray().reduce((groups, card) => {
      const result = groups;

      if (!result[card[groupProperty]]) {
        result[card[groupProperty]] = [card];
      } else {
        result[card[groupProperty]].push(card);
      }

      return result;
    }, {});
  }

  /**
   * Returns a new Object with suit IDs as keys, each mapping to an array of Cards as values.
   * The Card arrays are sorted in descending order of face value.
   * Suits with no cards will not be represented in the object.
   */
  getGroupsBySuit() {
    return this.getGroupsBy('suit');
  }

  /**
   * Returns a new Object with face IDs as keys, each mapping to an array of Cards as values.
   * The Card arrays are sorted in descending order of face value.
   * Suits with no cards will not be represented in the object.
   */
  getGroupsByFaceValue() {
    return this.getGroupsBy('face');
  }

  /**
   * Convenience function that separates this set's Cards into buckets based on face value,
   * returning bucket(s) that have the specified size. Used to detect pairs, triples, and quads.
   *
   * @param {int} size
   */
  getFaceGroupsOfSize(size) {
    const faceGroups = this.getGroupsByFaceValue();
    const faces = Object.keys(faceGroups).filter(key => faceGroups[key].length >= size);

    return faces.reduce((acc, currentFace) => {
      acc[currentFace] = Array.from(faceGroups[currentFace]);
      return acc;
    }, {});
  }

  /**
   * Finds a straight inside this CardSet if one exists.
   *
   * @param {Boolean} options.royalFlush finds Royal Flush
   * @param {Boolean} options.straightFlush finds Straight Flush
   *
   * @return Array containing 5 cards in descending order if a straight is found;
   *  undefined otherwise
   */
  getStraight(options = {}) {
    const { royalFlush, straightFlush } = options;

    // Our search space is partitioned by suit in the case of royal/straight flush.
    // If looking for a regular straight, the search space is all cards (of all suits).
    const searchBuckets = royalFlush || straightFlush
      ? Object.values(this.getGroupsBySuit())
      : [this.toSortedArray()];

    // Find and return the first (ie. only) occurrence of a 5-card straight within the 5
    // community cards + 2 hand cards
    return searchBuckets.map((cardArray) => {
      // See if a straight is found in the current bucket by reducing it with a search function
      const possibleStraight = cardArray.reduce((acc, current, index, sourceArray) => {
        let result = [current];

        // Get the last card in the accumulator
        const [previous] = acc.slice(-1);

        if (acc.length === 5) {
          // Base case - return a completed straight immediately
          result = acc;
        } else if (!previous) {
          // First card in the set (or is an Ace when we're searching for a royal flush)
          result = !royalFlush || (royalFlush && current.face === 'A') ? [current] : [];
        } else if (current.face === previous.face) {
          // Same card; skip
          result = acc;
        } else if (current.isImmediatelyAfter(previous)) {
          // Current card is adjacent to the previous card
          result = [...acc, current];
        }

        // Special case for straight and straight flush... treat aces as low
        if (!royalFlush && (current.face === '2' && result.length === 4)) {
          const possibleAce = sourceArray.find(card => card.face === 'A');

          if (possibleAce) {
            result = [...result, possibleAce];
          }
        }

        return result;
      }, []);
      return possibleStraight.length !== 5 ? false : possibleStraight;
    }).find(Boolean);
  }

  /**
   * Returns a new Array of cards sorted in descending order of face value
   * (ie. highest face cards first).
   */
  toSortedArray() {
    return Array.from(this).sort(Card.faceValueComparator);
  }

  /**
   * Get a string representation of this CardSet in the form of a sorted array
   * of the Cards it contains.
   */
  toString() {
    return `[${this.map(card => `${card.face}${card.suit}`).join(', ')}]`;
  }

  /**
   * Parse a CardSet from a string of valid Card strings (space-separated).
   * For example:
   * "AD KD QD" would parse to a CardSet of size 3, with an ace, king, and queen of diamonds.
   *
   * @param {String} cardsString
   */
  static fromString(cardsString) {
    return new CardSet(cardsString.split(' ').map(Card.fromString));
  }
}

/**
 * Hand represents a player's state in a game of Texas Hold'em - their name
 * and their two hole cards.
 */
class Hand {
  constructor(name, cards = []) {
    if (cards.length !== 2) {
      throw new Error(`Player '${name}' must have two cards!`);
    }

    this.name = name;
    this.cards = new CardSet(cards);
  }

  /**
   * Parses a Hand from a string. A valid Hand string has the form:
   *
   * <name> <card1String> <card2String>
   *
   * @param {String} handString
   */
  static fromString(handString) {
    const [name, ...cardStrings] = handString.split(' ')
      .map(str => str.trim()) // Strip whitespace from strings
      .filter(Boolean); // Omit falsy values
    const cards = cardStrings.map(Card.fromString);
    return new Hand(name, cards);
  }

  /**
   * Sorts Hands by their Result class, higher-value hands (eg. Royal Flush) coming
   * before lower-value hands (eg. High Card). The comparator returns 0 for hand
   * results of the same class (tie-breaking is done elsewhere).
   *
   * @param {Hand} handA
   * @param {Hand} handB
   */
  static classRankComparator(handA, handB) {
    return handA.result.handRank - handB.result.handRank;
  }

  static tieBreakerReducer([previousHands = [], currentHandGroup = [], lastRank = 0], currentHand) {
    console.log(previousHands, currentHandGroup, lastRank);
    
    if (previousHand && current) {

    }
    // const processedHand = currentHand;

    // const [lastHand] = hands.slice(-1);
    // const previousHands = hands.slice(0, hands.length - 2);

    // if (lastHand && currentHand.result.handRank === lastHand.result.handRank) {
    //   const compareResult = currentHand.result.comparator(lastHand.result, currentHand.result);

    //   // Swap this hand with the last hand
    //   if (compareResult > 0) {
    //     return [...previousHands, processedHand, lastHand];
    //   }
    // }

    // processedHand.result.rank = index + 1;

    // return [...hands, processedHand];
  }
}

/**
 * HandResult is a class that encapsulates information about a hand formed in Texas Hold'em.
 * It contains the name of the hand (eg. "Royal Flush"), its relative value to other hands,
 * and some functions that aid in formatting its value in a human-readable way.
 *
 * HandResults are instantiated using static functions whose parameters correspond to the details
 * of each possible hand.
 */
class HandResult {
  constructor(options = {}) {
    Object.assign(this, options);
  }

  toString() {
    return `${this.name} ${this.getHandResultString()}`;
  }

  /**
   * Static builders
   *
   * The following static functions take explicit inputs and map them to a HandResult object.
   *
   * Each builder must initialize a HandResult with the following minimum properties:
   *
   * - name: Name of the hand (eg. "Royal Flush")
   * - handRank: Index of the hand (lower index is higher-value)
   * - cards: Full CardSet of the union of community cards and hole cards for the player
   * - getHandResultString: a Function returning a String representing the kicker(s)
   *
   * In the future, a comparator(HandResult, HandResult) function will be accepted and used to break
   * ties within hands of the same type.
   */

  static buildRoyalFlush(cards, flush) {
    return new HandResult({
      name: 'Royal Flush',
      handRank: 0,
      cards,
      getHandResultString: () => flush[0].getSuit(),
      comparator: () => 0, // Royal flushes are always considered equal
    });
  }

  static buildStraightFlush(cards, flush) {
    return new HandResult({
      name: 'Straight Flush',
      handRank: 1,
      cards,
      getHandResultString: () => flush[0].getFaceName(),
      comparator: () => 0, // TODO
    });
  }

  static buildFourOfAKind(cards, quad) {
    return new HandResult({
      name: 'Four of a Kind',
      handRank: 2,
      cards,
      getHandResultString: () => quad[0].getFaceName(),
      comparator: () => 0, // TODO
    });
  }

  static buildFullHouse(cards, triple, pair) {
    return new HandResult({
      name: 'Full House',
      handRank: 3,
      cards,
      triple,
      pair,
      getHandResultString: () => [triple, pair].map(group => group[0].getFaceName()).join(' '),
      comparator: (resultA, resultB) => {
        let result = 0;

        // First, compare triples value
        result = Card.faceValueComparator(resultA.triple[0], resultB.triple[0]);

        // If triples are the same, compare doubles value
        if (!result) {
          result = Card.faceValueComparator(resultA.double[0], resultB.double[0]);
        }

        return result;
      },
    });
  }

  static buildFlush(cards, flush) {
    return new HandResult({
      name: 'Flush',
      handRank: 4,
      cards,
      getHandResultString: () => flush[0].getFaceName(),
      comparator: () => 0, // TODO
    });
  }

  static buildStraight(cards, straight) {
    return new HandResult({
      name: 'Straight',
      handRank: 5,
      cards,
      getHandResultString: () => straight[0].getFaceName(),
      comparator: () => 0, // TODO
    });
  }

  static buildThreeOfAKind(cards, triple) {
    return new HandResult({
      name: 'Three of a Kind',
      handRank: 6,
      cards,
      getHandResultString: () => triple[0].getFaceName(),
      comparator: () => 0, // TODO
    });
  }

  static buildTwoPair(cards, pairs) {
    return new HandResult({
      name: 'Two Pair',
      handRank: 7,
      cards,
      getHandResultString: () => pairs.map(pair => pair[0].getFaceName()).join(' '),
      comparator: () => 0, // TODO
    });
  }

  static buildOnePair(cards, pair) {
    return new HandResult({
      name: 'Pair',
      handRank: 8,
      cards,
      getHandResultString: () => pair[0].getFaceName(),
      comparator: () => 0, // TODO
    });
  }

  static buildHighCard(cards, highCard) {
    return new HandResult({
      name: 'High',
      handRank: 9,
      cards,
      getHandResultString: () => highCard.getFaceName(),
      comparator: () => 0, // TODO
    });
  }
}

module.exports = {
  Card,
  CardSet,
  Hand,
  HandResult,
};
