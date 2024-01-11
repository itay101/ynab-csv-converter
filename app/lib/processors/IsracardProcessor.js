import ExcelFileProcessor from "@/lib/processors/base/ExcelFileProcessor";
import {getConfigByIdentifier} from "@/lib/accounts";
import * as XLSX from "xlsx";

const VALUES_IN_FIRST_CELL_TO_SKIP = [
    "תאריך רכישה",
    "עסקאות בחו˝ל",
    "דביט VISA ",
    'אין נתונים להצגה'
]

const MAIN_TABLE_COLUMN_INDEX_DATE = 0;
const MAIN_TABLE_COLUMN_INDEX_PAYEE = 1;
const MAIN_TABLE_COLUMN_INDEX_MEMO = 7;
const MAIN_TABLE_COLUMN_INDEX_AMOUNT = 4;
const SECONDARY_TABLE_COLUMN_INDEX_DATE = 0;
const SECONDARY_TABLE_COLUMN_INDEX_PAYEE = 2;
const SECONDARY_TABLE_COLUMN_INDEX_MEMO = 7;
const SECONDARY_TABLE_COLUMN_INDEX_AMOUNT = 5;

export default class IsracardProcessor extends ExcelFileProcessor {
    constructor() {
        super("xls");
    }

    async getIdentifier(file) {
        return await this.extractDataFromExcel(file)
    }

    async process(file) {
        const rows = [];
        let isSecondaryTable = false;
        const workbook = await this.readExcelFile(file);
        const identifier = await this.getIdentifier(file)
        const {account_id} = getConfigByIdentifier(identifier);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rowObjectArray = XLSX.utils.sheet_to_row_object_array(worksheet);
        for (let rowObject in rowObjectArray) {
            const row = Object.values(rowObjectArray[rowObject]);
            if (!this.isValidDate(row[MAIN_TABLE_COLUMN_INDEX_DATE])){
                continue
            }
            if (!isSecondaryTable && this.isMainTableRow(row)) {
                rows.push(this.getMainTableRowObject(row, account_id))
            } else if (isSecondaryTable || this.isSecondaryTable(row)) {
                if (this.shouldSkipRow(row)) {
                    continue
                }
                isSecondaryTable = true
                rows.push(this.getSecondaryTableRowObject(row, account_id))
            }
        }
        return rows;
    }

    getMainTableRowObject(row, account_id) {
        const [day, month, year] = this.splitDate(row[MAIN_TABLE_COLUMN_INDEX_DATE])
        const date = this.getYnabDate(year, month, day);
        return this.getYnabJsonObject(
            date,
            row[MAIN_TABLE_COLUMN_INDEX_PAYEE],
            row[MAIN_TABLE_COLUMN_INDEX_MEMO],
            this.getYnabAmount(row[MAIN_TABLE_COLUMN_INDEX_AMOUNT]),
            account_id)
    }

    getSecondaryTableRowObject(row, account_id) {
        const [day, month, year] = this.splitDate(row[SECONDARY_TABLE_COLUMN_INDEX_DATE])
        const date = this.getYnabDate(year, month, day);
        return this.getYnabJsonObject(
            date,
            row[SECONDARY_TABLE_COLUMN_INDEX_PAYEE],
            row[SECONDARY_TABLE_COLUMN_INDEX_MEMO],
            this.getYnabAmount(row[SECONDARY_TABLE_COLUMN_INDEX_AMOUNT]),
            account_id)
    }

    splitDate(value) {
        return value.split("/")
    }

    isMainTableRow(row) {
        return row[1] !== "" && !this.isValidDate(row[1]);
    }

    isSecondaryTable(row) {
        return this.isValidDate(row[1])
    }

    shouldSkipRow(row) {
        return !row[0] ||
            VALUES_IN_FIRST_CELL_TO_SKIP.some(item => this.matchValueInFirstCellToSkip(item, row[0]));

    }

    matchValueInFirstCellToSkip(skip_value, cell_value) {
        return cell_value.match(skip_value);
    }

    isValidDate(dateString) {
        // Define a regular expression pattern for DD/MM/YYYY format
        var datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

        // Test the date string against the pattern
        if (datePattern.test(dateString)) {
            // Check if the date is a valid date using JavaScript Date object
            var dateParts = dateString.split('/');
            var day = parseInt(dateParts[0], 10);
            var month = parseInt(dateParts[1], 10) - 1; // Month is zero-based
            var year = parseInt(dateParts[2], 10);

            var testDate = new Date(year, month, day);

            // Check if the components of the date match the input
            return (
                testDate.getDate() === day &&
                testDate.getMonth() === month &&
                testDate.getFullYear() === year
            );
        }

        // If the date string doesn't match the pattern, it's not in the correct format
        return false;
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