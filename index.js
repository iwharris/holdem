#!/usr/bin/env node

const { readInput, readArgs } = require('./src/utils');
const { parseInput, rankHands } = require('./src/holdem');
const { version } = require('./package.json');

// Read command-line arguments
const { isVerbose, printHelp } = readArgs(process.argv);

const helpInfo = `
Holdem v${version}

Usage:    holdem [-v] [input]
Example:  holdem < sample.txt

Arguments:
-h or --help      : Print this message
-v or --verbose   : Print community cards, hole cards, and detailed error traces

Sample input:
KS AD 3H 7C TD
John 9H 7S
Sam AC KH
Becky JD QC
Ian KD KC
`;

function main() {
  // Read stdin
  const lines = readInput();

  // Parse game state from input
  const { communityCards, hands } = parseInput(lines);

  // If verbose mode is enabled, print the community cards
  if (isVerbose) {
    console.log(`Community cards: ${communityCards.toString()}`);
  }

  // Determine each player's hand and sort them in order of hand value
  const ranking = rankHands(communityCards, hands);

  // Print each ranking, player name, and hand
  ranking.forEach((hand, index) => console.log(`${index + 1} ${hand.name} ${hand.result.toString()}${isVerbose ? ` ${hand.cards.toString()}` : ''}`));
}

try {
  if (printHelp) {
    console.log(helpInfo);
  } else {
    main();
  }
  process.exit(0);
} catch (err) {
  console.error(isVerbose ? err : `Error: ${err.message}`);
  console.log(helpInfo);
  process.exit(1);
}
