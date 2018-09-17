#!/usr/bin/env node

const fs = require('fs');

const data = fs.readFileSync(0, 'utf8'); // Read data from stdin

class CardSet extends Set {
	/**
	 * Convenience function; workaround for the Set class lacking a map() function.
	 * @param {*} func function that will be applied to each element of the Set
	 */
	map(func) {
		return Array.from(this).map(func);
	}
}

class Card {

	constructor(face, suit) {
		this.face = face;
		this.suit = suit;
	}

	getNumericFaceValue() {
		switch(this.face) {
			case 'T': return 10;
			case 'J': return 11;
			case 'Q': return 12;
			case 'K': return 13;
			case 'A': return 14; // Exception: ace can be low in a straight, high otherwise
			default: return parseInt(this.face);
		}
	}

	getFace() {
		switch(this.face) {
			case 'A': return 'Ace';
			case 'T': return 'Ten';
			case 'J': return 'Jack';
			case 'Q': return 'Queen';
			case 'K': return 'King';
			default: return this.face;
		};
	}

	getSuit() {
		switch(this.suit) {
			case 'D': return 'Diamonds';
			case 'H': return 'Hearts';
			case 'S': return 'Spades';
			case 'C': return 'Clubs';
		};
	}

	static fromString(cardString) {
		const [value, suit] = cardString;
		return new Card(value, suit);
	}

	toString() {
		return `${this.getFace()} of ${this.getSuit()} (${this.getNumericFaceValue()})`;
	}
}

class Hand {
	constructor(name, cards=[]) {
		this.name = name;
		this.cards = new CardSet(cards);
	}

	getValue() {
		// TODO compute value of hand
		return 0;
	}

	static fromString(handString) {
		const [name, ...cardStrings] = handString.split(' ');
		const cards = cardStrings.map(Card.fromString);
		return new Hand(name, cards);
	}

	toString() {
		return `${this.name}: ${this.cards.map(c => c.toString()).join(', ')}`;
	}

	computeHandValue(communityCards) {
		const fullHand = this.cards
	}
}

const lines = data.split('\n') 	// Split data on newlines
	.map(str => str.trim()) 	// Trim whitespace
	.filter(Boolean); 			// Omit empty (falsy) lines

// Print raw input
// lines.forEach(line => console.log(line))

const [communityCardsString, ...handStrings] = lines;

const communityCards = communityCardsString.split(' ').map(Card.fromString);
const hands = handStrings.map(Hand.fromString);

console.log('Community cards:', communityCards.map(c => c.toString()).join(', '));
hands.forEach(hand => console.log(hand.toString()));

