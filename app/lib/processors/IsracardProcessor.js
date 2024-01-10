import ExcelFileProcessor from "@/lib/processors/base/ExcelFileProcessor";

export default class IsracardProcessor extends ExcelFileProcessor {
    constructor() {
        super("xls");
    }

    async getIdentifier(file) {
        return await this.extractDataFromExcel(file)
    }

    async extractDataFromExcel(file) {
        try {
            const sheetName = null;
            const row = 4;
            const column = 'A'; // Assuming the value is in the first column of the second row

            const inputValue = await this.getCellValue(file, sheetName, row, column);

            // Extract the desired portion of the input value
            const outputValue = inputValue.split(' - ')[1].trim();

            return outputValue;
        } catch (error) {
            console.error('Error extracting data from Excel:', error.message);
            throw error;
        }
    }
}