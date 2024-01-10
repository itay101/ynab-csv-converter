import ExcelFileProcessor from "@/lib/processors/base/ExcelFileProcessor";

export default class MaxProcessor extends ExcelFileProcessor {
    constructor() {
        super();
    }

    async getIdentifier(file) {
        return await this.extractDataFromExcel(file)
    }

    async extractDataFromExcel(filePath) {
        try {
            const sheetName = 'עסקאות במועד החיוב'; // Replace with your actual sheet name
            const row = 2;
            const column = 'A'; // Assuming the value is in the first column of the second row

            const inputValue = await this.getCellValue(filePath, sheetName, row, column);

            // Extract the desired portion of the input value
            const outputValue = inputValue.split('-')[0].trim();

            return outputValue;
        } catch (error) {
            console.error('Error extracting data from Excel:', error.message);
            throw error;
        }
    }
}