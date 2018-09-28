const {
	FACE_VALUES,
	FACE_VALUE_NAMES,
	SUITS,
	SUIT_NAMES,
} = require('./constants');

class CardSet extends Set {
  map(mapFunc) {
    return this.toSortedArray().map(mapFunc);
  }

  filter(filterFunc) {
    return this.toSortedArray().filter(filterFunc);
  }

  /* Set operations */

  /**
   * Given another Cardset, returns a new CardSet that represents the union of this CardSet
   * and the other CardSet (ie. all elements of both CardSets without duplicates).
   *
   * @param {*} otherSet A new Cardset
   */
  union(otherSet) {
    return new CardSet([...this, ...otherSet]);
  }

  intersection(otherSet) {
    return new CardSet([...this].filter(card => otherSet.has(card)));
  }

  difference(otherSet) {
    return new CardSet([...this].filter(card => !otherSet.has(card)));
  }

  /* Conversions */

  getGroupsBy(groupProperty) {
		return this.toSortedArray().reduce((groups, card) => {
			if (!groups[card[groupProperty]]) {
				groups[card[groupProperty]] = [card];
			} else {
				groups[card[groupProperty]].push(card);
			}

			return groups;
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
   * @param {Boolean} options.royalFlush finds Royal Flush
   * @param {Boolean} options.straightFlush finds Straight Flush
   *
   * @return Array containing 5 cards in descending order if a straight is found; undefined otherwise
   */
  getStraight(options = {}) {
    const { royalFlush, straightFlush } = options;

    // Our search space is partitioned by suit in the case of royal/straight flush; otherwise, any suit goes
    const searchBuckets = royalFlush || straightFlush ? Object.values(this.getGroupsBySuit()) : [this.toSortedArray()];

    // console.log('Options:', options, 'searchBuckets', searchBuckets)

    // Find and return the first (ie. only) occurrence of a 5-card straight within the 5 community cards + 2 hand cards
    return searchBuckets.map((cardArray) => {

      // See if a straight is found in the current bucket by reducing it with a search function
      const possibleStraight = cardArray.reduce((acc, current) => {

        // Get the last card in the accumulator
        const [previous] = acc.slice(-1);

        if (acc.length === 5) { // Base case - return a completed straight immediately
          return acc;
        } else if (!previous) { // First card in the set (or is an Ace when we're searching for a royal flush)
          return !royalFlush || (royalFlush && current.face === 'A') ? [current] : [];
        } else if (current.face === previous.face) { // Same card; skip
          return acc;
        } else if (current.isImmediatelyAfter(previous)) { // Current card is adjacent to the previous card
          return [...acc, current];
        } else { // Reset the accumulator because this card isn't adjacent to the previous
          return [];
        }
      }, []);
      return possibleStraight.length != 5 ? false : possibleStraight;
    }).find(Boolean);
  }

  /**
   * Returns a new Array of cards sorted in descending order of face value
   * (ie. highest face cards first).
   */
  toSortedArray() {
    return Array.from(this).sort(Card.faceValueComparator);
  }

  toString() {
    return this.map(card => `${card.face}${card.suit}`).join(', ');
  }
}

class Card {
	constructor(face, suit) {
    if (!SUITS.includes(suit)) {
      throw new Error(`'${suit}' is not a valid suit`);
    }

    if (!FACE_VALUES.includes(face)) {
      throw new Error(`'${face} is not a valid face'`);
    }
		this.face = face;
		this.suit = suit;
  }

	getNumericFaceValue() {
		return FACE_VALUES.findIndex(v => v === this.face) + 2;
	}

	getFaceName() {
		return FACE_VALUE_NAMES[this.face] || this.face;
	}

	getSuit() {
		return SUIT_NAMES[this.suit];
	}

  toString() {
    return `${this.getFaceName()} of ${this.getSuit()} (${this.getNumericFaceValue()})`;
  }

  isImmediatelyAfter(previousCard) {
    return (previousCard.getNumericFaceValue() - this.getNumericFaceValue() === 1) || (previousCard.face === '2' && this.face === 'A')
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

class Hand {
	constructor(name, cards=[]) {
		this.name = name;
    this.cards = new CardSet(cards);
	}

	static fromString(handString) {
    const [name, ...cardStrings] = handString.split(' ')
      .map(str => str.trim()) // Strip whitespace from strings
      .filter(Boolean); // Omit falsy values
    const cards = cardStrings.map(Card.fromString);
    if (cards.length !== 2) {
      throw new Error(`Player '${name}' must have two cards!`);
    }
		return new Hand(name, cards);
	}

	toString() {
		return `${this.name}: ${this.cards.map(c => c.toString()).join(', ')}`;
	}
}

class HandResult {
  constructor(options = {}) {
    Object.assign(this, options);
  }

  // getHandResultString() {
  //   return 'NOT IMPLEMENTED';
  // }

  toString() {
    return `${this.name} ${this.getHandResultString()}`;
  }

  // compareHands(handA, handB) {
  //   if (handA.handRank != handB.handRank) {
  //     return handB.handRank - handA.handRank; // Lower handRank should come first
  //   } else {
  //     return this.comparator(handA, handB);
  //   }
  // }

  static buildRoyalFlush(cards, flush) {
    return new HandResult({
      name: 'Royal Flush',
      handRank: 0,
      cards,
      getHandResultString: () => flush[0].getSuit(),
    });
  }

  static buildStraightFlush(cards, flush) {
    return new HandResult({
      name: 'Straight Flush',
      handRank: 1,
      cards,
      getHandResultString: () => flush[0].getFaceName(),
    });
  }

  static buildFourOfAKind(cards, quad) {
    return new HandResult({
      name: 'Four of a Kind',
      handRank: 2,
      cards,
      getHandResultString: () => quad[0].getFaceName(),
    });
  }

  static buildFullHouse(cards, triple, pair) {
    return new HandResult({
      name: 'Full House',
      handRank: 3,
      cards,
      getHandResultString: () => [triple, pair].map(group => group[0].getFaceName()).join(' '),
    });
  }

  static buildFlush(cards, flush) {
    return new HandResult({
      name: 'Flush',
      handRank: 4,
      cards,
      getHandResultString: () => flush[0].getFaceName(),
    });
  }

  static buildStraight(cards, straight) {
    return new HandResult({
      name: 'Straight',
      handRank: 5,
      cards,
      getHandResultString: () => straight[0].getFaceName(),
    });
  }

  static buildThreeOfAKind(cards, triple) {
    return new HandResult({
      name: 'Three of a Kind',
      handRank: 6,
      cards,
      getHandResultString: () => triple[0].getFaceName(),
    });
  }

  static buildTwoPair(cards, pairs) {
    return new HandResult({
      name: 'Two Pair',
      handRank: 7,
      cards,
      getHandResultString: () => pairs.map(pair => pair[0].getFaceName()).join(' '),
    });
  }

  static buildOnePair(cards, pair) {
    return new HandResult({
      name: 'Pair',
      handRank: 8,
      cards,
      getHandResultString: () => pair[0].getFaceName(),
    });
  }

  static buildHighCard(cards, highCard) {
    return new HandResult({
      name: 'High',
      handRank: 9,
      cards,
      getHandResultString: () => highCard.getFaceName(),
    });
  }
}

module.exports = {
  Card,
  CardSet,
  Hand,
  HandResult,
};
