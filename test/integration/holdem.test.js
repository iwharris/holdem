const { parseInput, rankHands } = require('../../src/holdem');

describe.only('Holdem Core (Integration)', () => {
  describe('rankHands', () => {
    it('should break ties between full house hands', () => {
      const lines = [
        'KH KD KS AD AS',
        'Bar TS JD',
        'Foo AC TD',
      ];
      const { communityCards, hands } = parseInput(lines);

      const rankedHands = rankHands(communityCards, hands);

      expect(rankedHands).toHaveLength(2);
      expect(rankedHands[0].result.rank).toBe(1);
      expect(rankedHands[0].name).toBe('Foo');
      expect(rankedHands[0].result.toResultString()).toBe('Full House Ace King');
      expect(rankedHands[1].result.rank).toBe(2);
      expect(rankedHands[1].name).toBe('Bar');
      expect(rankedHands[0].result.toResultString()).toBe('Full House King Ace');
    });
  });
});
