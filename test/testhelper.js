const { FACE_VALUES, SUITS } = require('../src/constants');

/**
 * Test Helpers
 *
 * Provides some helper functions and builders to simplify testing.
 */

/**
 * Picks a random element from an array.
 *
 * @param {*} array
 */
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a random valid card string (eg. "AD" or "2H").
 * The output can be restricted by face and/or suit by providing an options hash
 * with "suit" and/or "face" properties.
 *
 * @param {*} options.face if provided, sets the resulting face
 * @param {*} options.suit if provided, sets the resulting suit
 */
function randomCardString({ face, suit }) {
  return `${face || randomElement(FACE_VALUES)}${suit || randomElement(SUITS)}`;
}

module.exports = {
  randomElement,
  randomCardString,
};
