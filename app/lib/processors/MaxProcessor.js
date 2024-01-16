import * as XLSX from 'xlsx'

import ExcelFileProcessor from "@/lib/processors/base/ExcelFileProcessor";
import {getConfigByIdentifier} from "@/lib/accounts";

const SHEETS_TO_PROCESS = [
    {name: 'עסקאות במועד החיוב'},
    {name: "עסקאות חו\"ל ומט\"ח"}
]
const COLUMN_INDEX_DATE = 0;
const COLUMN_INDEX_PAYEE = 1;
const COLUMN_INDEX_MEMO = 10;
const COLUMN_INDEX_AMOUNT = 5;

export default class MaxProcessor extends ExcelFileProcessor {
    constructor() {
        super();
    }

    async process(file) {
        const workbook = await this.readExcelFile(file);
        const identifier = await this.getIdentifier(file)
        const {account_id} = getConfigByIdentifier(identifier);
        const rows = [];
        SHEETS_TO_PROCESS.forEach(sheet => {
            const worksheet = workbook.Sheets[sheet.name];
            const rowObjectArray = XLSX.utils.sheet_to_row_object_array(worksheet);
            for (let rowObject in rowObjectArray) {
                const row = Object.values(rowObjectArray[rowObject]);
                const [shouldSkipRow, isNextRowBalance] = this.shouldSkipRow(row)
                if (shouldSkipRow) {
                    continue;
                }
                const [day, month, year] = row[COLUMN_INDEX_DATE].split("-")
                try {
                    const date = this.getYnabDate(year, month, day);
                    rows.push(
                        this.getYnabJsonObject(
                            date,
                            row[COLUMN_INDEX_PAYEE],
                            row[COLUMN_INDEX_MEMO],
                            this.getYnabAmount(row[COLUMN_INDEX_AMOUNT]),
                            account_id)
                    )
                } catch {
                }
            }

        })

        return rows;
    }

    async getIdentifier(file) {
        return await this.extractDataFromExcel(file)
    }

    async extractDataFromExcel(file) {
        try {
            const sheetName = SHEETS_TO_PROCESS[0].name; // Replace with your actual sheet name
            const row = 2;
            const column = 'A'; // Assuming the value is in the first column of the second row

            const inputValue = await this.getCellValue(file, sheetName, row, column);

            return inputValue.split('-')[0].trim();
        } catch (error) {
            console.error('Error extracting data from Excel:', error.message);
            throw error;
        }
    }

    shouldSkipRow(row) {
        const isNextRowBalance = row[0] === "סך הכל"
        if (!row[0] || isNextRowBalance || this.isDate(row[0])) {
            return [true, isNextRowBalance]
        }
        return [false, isNextRowBalance]
    }

    isDate(testString) {
        const pattern = '^\d{2}-\d{2}-\d{4}$';
        return testString.match(pattern)
    }
}