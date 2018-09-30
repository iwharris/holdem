const crypto = require('crypto');

const { FACE_VALUES, SUITS } = require('../src/constants');

/**
 * Test Helpers
 *
 * Provides some helper functions and builders to simplify testing.
 */

/**
 * Generates a random string of the specified length.
 * @param {*} length
 */
function randomString(length = 5) {
  return crypto.randomBytes(length).toString('hex').substr(0, length);
}

/**
 * Picks a random element from an array.
 *
 * @param {*} array
 */
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomSuit() {
  return randomElement(SUITS);
}

function randomFace() {
  return randomElement(FACE_VALUES);
}

/**
 * Generates a random valid card string (eg. "AD" or "2H").
 * The output can be restricted by face and/or suit by providing an options hash
 * with "suit" and/or "face" properties.
 *
 * @param {*} options.face if provided, sets the resulting face
 * @param {*} options.suit if provided, sets the resulting suit
 */
function randomCardString(options = {}) {
  return `${options.face || randomFace()}${options.suit || randomSuit()}`;
}

/**
 * Generates an array of the specified length using the specified generator function.
 * The generator function is provided one argument: the index in the array.
 *
 * @param {*} length
 * @param {*} generatorFunc
 */
function generateArray(length, generatorFunc = () => undefined) {
  const array = [];

  for (let i = 0; i < length; i += 1) {
    array.push(generatorFunc());
  }

  return array;
}

module.exports = {
  randomString,
  randomElement,
  randomSuit,
  randomFace,
  randomCardString,
  generateArray,
};
