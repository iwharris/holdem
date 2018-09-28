// Mock the 'fs' module for tests
const fsMock = jest.genMockFromModule('fs');

// Stub out the readFileSync function with an empty implementation
fsMock.readFileSync = jest.fn(() => '');

module.exports = fsMock;
