import {beforeEach, expect, jest} from "@jest/globals";

const AccountTypeToProcessor = require('./AccountTypeToProcessor');
const configApi = require('./configApi');

// Mock dependencies
jest.mock('./AccountTypeToProcessor');
jest.mock('./configApi');

// Import the function to be tested
const getTransactionsFromFile = require('./getTransactionsFromFile');

describe('getTransactionsFromFile', () => {
  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    jest.clearAllMocks();
  });

  test('returns transactions when account identifier is found', () => {
    const accounts = /* mock accounts data */;
    const f = /* mock file data */;
    const filename = /* mock filename */;
    const processorMock = {
      identifyAccount: jest.fn(() => 'accountIdentifier'),
      getTransactions: jest.fn(() => ['transaction1', 'transaction2']),
    };
    const configMock = {
      accountId: 'accountId',
    };

    // Mock the AccountTypeToProcessor class and its methods
    AccountTypeToProcessor.prototype.getProcessors.mockReturnValue([processorMock]);

    // Mock the configApi.getAccountConfigByIdentifier method
    configApi.getAccountConfigByIdentifier.mockReturnValue(configMock);

    // Call the function to be tested
    const result = getTransactionsFromFile(accounts, f, filename);

    // Check if the expected methods were called
    expect(AccountTypeToProcessor.prototype.getProcessors).toHaveBeenCalledTimes(1);
    expect(processorMock.identifyAccount).toHaveBeenCalledTimes(1);
    expect(processorMock.identifyAccount).toHaveBeenCalledWith(f, accounts);
    expect(configApi.getAccountConfigByIdentifier).toHaveBeenCalledTimes(1);
    expect(configApi.getAccountConfigByIdentifier).toHaveBeenCalledWith(accounts, 'accountIdentifier');
    expect(processorMock.getTransactions).toHaveBeenCalledTimes(1);
    expect(result).toEqual(['transaction1', 'transaction2']);
  });

  test('returns an empty array when account identifier is not found', () => {
    const accounts = /* mock accounts data */;
    const f = /* mock file data */;
    const filename = /* mock filename */;
    const processorMock = {
      identifyAccount: jest.fn(() => null),
    };

    // Mock the AccountTypeToProcessor class and its methods
    AccountTypeToProcessor.prototype.getProcessors.mockReturnValue([processorMock]);

    // Call the function to be tested
    const result = getTransactionsFromFile(accounts, f, filename);

    // Check if the expected methods were called
    expect(AccountTypeToProcessor.prototype.getProcessors).toHaveBeenCalledTimes(1);
    expect(processorMock.identifyAccount).toHaveBeenCalledTimes(1);
    expect(processorMock.identifyAccount).toHaveBeenCalledWith(f, accounts);
    expect(configApi.getAccountConfigByIdentifier).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('handles FileNotFound error and logs the error message', () => {
    const accounts = /* mock accounts data */;
    const f = /* mock file data */;
    const filename = /* mock filename */;
    const processorMock = {
      identifyAccount: jest.fn(() => 'accountIdentifier'),
      getTransactions: jest.fn(() => {
        throw new Error('File not found');
      }),
    };
    const configMock = {
      accountId: 'accountId',
    };

    // Mock the AccountTypeToProcessor class and its methods
    AccountTypeToProcessor.prototype.getProcessors.mockReturnValue([processorMock]);

    // Mock the configApi.getAccountConfigByIdentifier method
    configApi.getAccountConfigByIdentifier.mockReturnValue(configMock);

    // Spy on the console.log method
    jest.spyOn(console, 'log');

    // Call the function to be tested
    const result = getTransactionsFromFile(accounts, f, filename);

    // Check if the expected methods were called
    expect(AccountTypeToProcessor.prototype.getProcessors).toHaveBeenCalledTimes(1);
    expect(processorMock.identifyAccount).toHaveBeenCalledTimes(1);
    expect(processorMock.identifyAccount).toHaveBeenCalledWith(f, accounts);
    expect(configApi.getAccountConfigByIdentifier).toHaveBeenCalledTimes(1);
    expect(configApi.getAccountConfigByIdentifier).toHaveBeenCalledWith(accounts, 'accountIdentifier');
    expect(processorMock.getTransactions).toHaveBeenCalledTimes(1);

    // Check if the error message was logged
    expect(console.log).toHaveBeenCalledWith('File not found: undefined');

    // Check the result
    expect(result).toEqual([]);
  });
});
