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
    const straight = this.toSortedArray().reduce((acc, current) => {
      if (acc.length === 5) { // Short circuit if we found our straight
        return acc;
      }

      const [last] = acc.slice(-1);

      // Compare last with current

      console.log('last', last);
      console.log('acc', acc);
      console.log('current', current)
      acc.push(current);
      return acc;
    }, []);
    return straight.length != 5 ? false : straight;
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

  static buildRoyalFlush(cards) {
    return new HandResult({
      name: 'Royal Flush',
      handRank: 0,
      cards,
    });
  }

  static buildFourOfAKind(cards, quad) {
    return new HandResult({
      name: 'Four of a Kind',
      handRank: 2,
      cards,
      getHandResultString: () => `${quad[0].getFaceName()}`,
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
      getHandResultString: () => `${flush[0].getFaceName()}`
    });
  }

  static buildThreeOfAKind(cards, triple) {
    return new HandResult({
      name: 'Three of a Kind',
      handRank: 6,
      cards,
      getHandResultString: () => `${triple[0].getFaceName()}`,
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
      getHandResultString: () => `${pair[0].getFaceName()}`,
    });
  }

  static buildHighCard(cards, highCard) {
    return new HandResult({
      name: 'High',
      handRank: 9,
      cards,
      getHandResultString: () => `${highCard.getFaceName()}`,
    });
  }
}

module.exports = {
  Card,
  CardSet,
  Hand,
  HandResult,
};
