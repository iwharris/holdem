#!/usr/bin/env node

const fs = require('fs');

const {
	FACE_VALUES,
	FACE_VALUE_NAMES,
	SUITS,
	SUIT_NAMES,
} = require('./constants');


class CardSet extends Set {
	/**
	 * Convenience function; workaround for the Set class lacking a map() function.
	 * @param {*} func function that will be applied to each element of the Set
	 */
	map(func) {
		return Array.from(this).map(func);
  }

  getSortedArrayByValue() {
    // Returns cards in ascending order
    return Array.from(this).sort((cardA, cardB) => cardA.getNumericFaceValue() - cardB.getNumericFaceValue());
  }
}

function findHighCard(cardSet) {
  const sortedCards = cardSet.getSortedArrayByValue();

  // console.log('sorted array', sortedCards);
  return sortedCards[sortedCards.length-1];

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

	static fromString(cardString) {
		const [value, suit] = cardString;
		return new Card(value, suit);
	}

	toString() {
		return `${this.getFaceName()} of ${this.getSuit()} (${this.getNumericFaceValue()})`;
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

	computeHandValue(communityCards) {
    const combinedCards = new CardSet(Array.from(this.cards).concat(Array.from(communityCards)));

    const highCard = findHighCard(combinedCards);

    // TODO Compute the best hand you can make with these cards
    return false;
	}
}

function main() {
  const data = fs.readFileSync(0, 'utf8'); // Read data from stdin

  const lines = data.split('\n') 	// Split data on newlines
	.map(str => str.trim()) 	// Trim whitespace
  .filter(Boolean); 			// Omit empty (falsy) lines

if (lines.length < 2) { // A minimum of 1 line of community cards and 1 hand are required
  throw new Error('At least 2 lines of input are required.');
}

// Print raw input
// lines.forEach(line => console.log(line))

const [communityCardsString, ...handStrings] = lines;

const communityCards = new CardSet(communityCardsString.split(' ').map(Card.fromString));

if (communityCards.size !== 5) {
  throw new Error('5 community cards are required.');
}

const hands = handStrings.map(Hand.fromString);

console.log('Community cards:', communityCards.map(c => c.toString()).join(', '));
hands.forEach(hand => console.log(hand.toString(), hand.computeHandValue(communityCards)));
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.log(`Error: ${err.message}`);
  // console.error(err);
  process.exit(1);
}
