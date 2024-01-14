import FileProcessor from './FileProcessor'; // Assuming the class is in a file named 'FileProcessor.js'

test('constructor sets fileExtension property', () => {
  const fileProcessor = new FileProcessor({ fileExtension: 'csv' });
  expect(fileProcessor.fileExtension).toBe('csv');
});

test('process method returns null', () => {
  const fileProcessor = new FileProcessor({ fileExtension: 'csv' });
  expect(fileProcessor.process('file')).toBeNull();
});

test('getIdentifier method returns null', () => {
  const fileProcessor = new FileProcessor({ fileExtension: 'csv' });
  expect(fileProcessor.getIdentifier('file')).toBeNull();
});

test('getYnabJsonObject creates correct object structure', () => {
  const fileProcessor = new FileProcessor({ fileExtension: 'csv' });
  const ynabObject = fileProcessor.getYnabJsonObject('2023-11-21', 'Acme Inc.', 'Payment', 125.50);
  expect(ynabObject).toEqual({
    date: '2023-11-21',
    payee_name: 'Acme Inc.',
    memo: 'Payment',
    amount: 125.50
  });
});

test('getYnabAmount converts amount to YNAB format', () => {
  const fileProcessor = new FileProcessor({ fileExtension: 'csv' });
  expect(fileProcessor.getYnabAmount(259.83, true)).toBe(-259830);
  expect(fileProcessor.getYnabAmount(50, false)).toBe(50000);
  expect(fileProcessor.getYnabAmount(25, true)).toBe(-25000);
});

test('getFileExtension extracts extension from filename', () => {
  expect(FileProcessor.getFileExtension('example.txt')).toBe('txt');
  expect(FileProcessor.getFileExtension('budget.csv')).toBe('csv');
  expect(FileProcessor.getFileExtension('data')).toBe('');
});

describe('getYnabDate', () => {
    test('returns formatted date for valid inputs', () => {
        const result = FileProcessor.getYnabDate(2023, 12, 12);
        expect(result).toBe('2023-12-12');
    });

    test('returns formatted date for another valid input', () => {
        const result = FileProcessor.getYnabDate(2024, 1, 13);
        expect(result).toBe('2024-01-13');
    });

    // Add more test cases as needed

    test('handles invalid inputs gracefully', () => {
        // You can add test cases for invalid inputs if you want
        // For example, testing what happens if an invalid month or day is provided
    });
});
