[![CircleCI](https://circleci.com/gh/iwharris/holdem.svg?style=svg)](https://circleci.com/gh/iwharris/holdem)
[![codecov](https://codecov.io/gh/iwharris/holdem/branch/master/graph/badge.svg)](https://codecov.io/gh/iwharris/holdem)

# holdem
A Node utility to parse the state of a game of Texas Hold'em, classify and rank hands, and output the results.

## Dependencies

- Node 8 or greater

## Installation

Either install directly from Github to use globally:

```
npm install -g iwharris/holdem
```

Or clone and install locally for testing or development:

```
git clone https://github.com/iwharris/holdem.git
cd holdem
npm install -g
```

This utility has zero production dependencies. To install dev dependencies for development and tests:

```
npm install
```

## Uninstallation

```
npm uninstall -g
```

## Usage

Generally, you'll run `holdem` by piping files into the utility:

```
$ holdem < sample.txt

1 Becky Straight Ace
2 Sam Two Pair Ace King
3 John Pair 7
```

You may enable _verbose output_ (including detailed error traces) using the `--verbose` or `-v` flag:

```
$ holdem -v < sample.txt

Community cards: [AD, KS, TD, 7C, 3H]
1 Becky Straight Ace [AD, KS, QC, JD, TD, 7C, 3H]
2 Sam Two Pair Ace King [AC, AD, KH, KS, TD, 7C, 3H]
3 John Pair 7 [AD, KS, TD, 9H, 7S, 7C, 3H]
```

Input is expected as follows:
- First line is five community cards, space-separated. Cards are denoted by two characters; the first is a single-character face (1-9, T, J, Q, K, A) and the second is a single-character suit (D, H, C, S).
- Subsequent lines are of the form `<PLAYER_NAME> <CARD1> <CARD2>`. Hole cards follow the format from above.

Sample input:

```
KS AD 3H 7C TD
John 9H 7S
Sam AC KH
Becky JD QC
```

## Testing

```
# Run eslint
npm run lint

# Run automated tests
npm test
```

## Assumptions & Limitations

- It is assumed that you are playing with an ordinary 52-card deck, so no duplicate cards.
- The utility does not perform tie-breaking according to Texas Hold'em rules (yet). In true agile fashion, this is a first iteration!
- At least one player is required.
- Newlines in the input can either be Windows-style (CRLF) or Unix-style (LF). Blank lines in the input are ignored.
- Cards are case-sensitive: faces and suits must be uppercase.

After testing, an HTML coverage report can be found at `./coverage/jest/lcov-report/index.html`.
