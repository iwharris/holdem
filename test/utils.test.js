const { readArgs, readInput } = require('../src/utils');

// Mock the fs module
jest.mock('fs');

// Get the mocked module
const fsMock = require('fs');

describe('Utils', () => {
  describe('readArgs', () => {
    it('should return falsy flag values by default', () => {
      const { isVerbose } = readArgs(undefined);

      expect(isVerbose).toBeFalsy();
    });

    it('should correctly set flags when "--verbose" option is provided', () => {
      const { isVerbose } = readArgs(['--verbose']);

      expect(isVerbose).toBeTruthy();
    });

    it('should correctly set flags when "-v" option is provided', () => {
      const { isVerbose } = readArgs(['-v']);

      expect(isVerbose).toBeTruthy();
    });

    it('should parse isVerbose out of an array of multiple args', () => {
      const args = [
        'foo',
        '--bar',
        '--verbose',
        '--x=y',
        '-f',
      ];

      const { isVerbose } = readArgs(args);

      expect(isVerbose).toBeTruthy();
    });
  });

  describe('readInput', () => {
    beforeEach(() => {
      fsMock.readFileSync.mockClear(); // Reset call count
    });

    it('should parse lines from input', () => {
      const line1 = 'foo';
      const line2 = 'bar';

      const testInput = `${line1}\n${line2}`;

      fsMock.readFileSync.mockImplementationOnce(() => testInput);

      const lines = readInput();

      expect(fsMock.readFileSync).toBeCalledTimes(1);
      expect(lines).toHaveLength(2);
      expect(lines).toEqual([line1, line2]);
    });

    it('should handle Windows-style line endings (CRLF instead of LF)', () => {
      const line1 = 'foo';
      const line2 = 'bar';
      const testInput = `${line1}\r\n${line2}`;

      fsMock.readFileSync.mockImplementationOnce(() => testInput);

      const lines = readInput();

      expect(fsMock.readFileSync).toBeCalledTimes(1);
      expect(lines).toHaveLength(2);
      expect(lines).toEqual([line1, line2]);
    });

    it('should trim leading/trailing whitespace from input', () => {
      const line1 = 'foo';
      const line2 = 'bar';
      const line3 = 'baz';
      const testInput = ` \t${line1}   \r\n${line2}\t\n${line3}`;

      fsMock.readFileSync.mockImplementationOnce(() => testInput);

      const lines = readInput();

      expect(fsMock.readFileSync).toBeCalledTimes(1);
      expect(lines).toHaveLength(3);
      expect(lines).toEqual([line1, line2, line3]);
    });

    it('should throw an error if fewer than two non-empty lines are provided', () => {
      const testInputs = [
        '', // Empty string
        'foo', // One line
        'foo\n', // Blank second line
        'foo\r\n', // Windows-style line endings
        'foo\n\n\n', // Multiple empty lines
      ];

      testInputs.forEach((input) => {
        fsMock.readFileSync.mockImplementationOnce(() => input);

        expect(() => readInput()).toThrowError('At least 2 lines of input are required.');
      });
    });
  });
});
