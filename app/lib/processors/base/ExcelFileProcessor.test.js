import ExcelFileProcessor from '@/lib/processors/base/ExcelFileProcessor';

// Mocking the xlsx and xlsjs modules
jest.mock('xlsx', () => ({
  readFile: jest.fn(),
}));

jest.mock('xlsjs', () => ({
  readFile: jest.fn(),
}));

describe('ExcelFileProcessor', () => {
  let excelFileProcessor;

  beforeEach(() => {
    excelFileProcessor = new ExcelFileProcessor();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('readExcelFile', () => {
    it('should call readXLSXFile when the file extension is xlsx', async () => {
      const fileMock = {
        arrayBuffer: jest.fn().mockResolvedValue('fakeArrayBuffer'),
      };

      await excelFileProcessor.readExcelFile(fileMock);

      expect(require('xlsx').readFile).toHaveBeenCalledWith('fakeArrayBuffer');
    });

    it('should call readXLSFile when the file extension is not xlsx', async () => {
      const fileMock = {
        arrayBuffer: jest.fn().mockResolvedValue('fakeArrayBuffer'),
      };

      const excelFileProcessorWithXLS = new ExcelFileProcessor('xls');

      await excelFileProcessorWithXLS.readExcelFile(fileMock);

      expect(require('xlsjs').readFile).toHaveBeenCalledWith('fakeArrayBuffer');
    });
  });

  describe('getCellValue', () => {
    it('should return the cell value', async () => {
      const fileMock = {};
      const sheetName = 'Sheet1';
      const row = 1;
      const column = 'A';

      const fakeWorkbook = {
        SheetNames: [sheetName],
        Sheets: {
          [sheetName]: {
            [`${column}${row}`]: { v: 'cellValue' },
          },
        },
      };

      // Mock the readExcelFile function to return the fake workbook
      excelFileProcessor.readExcelFile = jest.fn().mockResolvedValue(fakeWorkbook);

      const result = await excelFileProcessor.getCellValue(fileMock, sheetName, row, column);

      expect(result).toBe('cellValue');
    });

    it('should return undefined when the cell does not exist', async () => {
      const fileMock = {};
      const sheetName = 'Sheet1';
      const row = 1;
      const column = 'A';

      const fakeWorkbook = {
        SheetNames: [sheetName],
        Sheets: {
          [sheetName]: {},
        },
      };

      // Mock the readExcelFile function to return the fake workbook
      excelFileProcessor.readExcelFile = jest.fn().mockResolvedValue(fakeWorkbook);

      const result = await excelFileProcessor.getCellValue(fileMock, sheetName, row, column);

      expect(result).toBeUndefined();
    });
  });
});
