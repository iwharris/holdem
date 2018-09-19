const {
	FACE_VALUES,
	FACE_VALUE_NAMES,
	SUITS,
	SUIT_NAMES,
} = require('./constants');

class CardSet extends Array {
  /**
   * Generic groupBy function. Groups
   * @param {*} groupProperty
   */
  getGroupsBy(groupProperty) {
		return this.reduce((groups, card) => {
			if (!groups[card[groupProperty]]) {
				groups[card[groupProperty]] = [card];
			} else {
				groups[card[groupProperty]].push(card);
			}

			return groups;
		}, {});
  }

  getGroupsBySuit() {
    return this.getGroupsBy('suit');
	}

	getGroupsByFaceValue() {
    return this.getGroupsBy('face');
  }

  sortByFaceValueDescending() {
    return this.sort((cardA, cardB) => cardB.getNumericFaceValue() - cardA.getNumericFaceValue());
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

	static fromString(cardString) {
		const [value, suit] = cardString;
		return new Card(value, suit);
	}
}

class Hand {
	constructor(name, cards=[]) {
		this.name = name;
    this.cards = CardSet.from(cards);
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

  toString() {
    return `${this.name} ${this.cards[0].getFaceName()}`;
  }

  compareHands(handA, handB) {
    if (handA.handRank != handB.handRank) {
      return handB.handRank - handA.handRank; // Lower handRank should come first
    } else {
      return this.comparator(handA, handB);
    }
  }

  static buildRoyalFlush() {

  }

  static buildFlush(cards) {
    return new HandResult({
      name: 'Flush',
      cards,
      comparator: (handA, handB) => {
        return 0;
      },
    });
  }

  static buildHighCard(cards) {
    console.log(cards);
    return new HandResult({
      name: 'High',
      cards,
      comparator: (handA, handB) => {
        return 0;
      },
    })
  }
}

module.exports = {
  Card,
  CardSet,
  Hand,
  HandResult,
};
