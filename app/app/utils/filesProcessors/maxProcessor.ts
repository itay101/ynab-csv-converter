import {readFile, set_fs} from "xlsx";
import RawExcelFile from "~/utils/filesProcessors/rawFiles/RawExcelFile";
import {HeaderMapItem} from "~/utils/filesProcessors/rawFiles/RawFile";
import * as fs from "fs";
import {AccountTypes} from '~/utils/filesProcessors/converter';

enum YnabCsvFields {
    DATE = "Date",
    PAYEE = "Payee",
    MEMO = "Memo",
    OUTFLOW = "Outflow",
}

export class MaxProcessor extends RawExcelFile {
    _headerMapping: HeaderMapItem[] = [
        {source: "תאריך עסקה", target: YnabCsvFields.DATE},
        {source: "שם בית עסק", target: YnabCsvFields.PAYEE},
        {source: "הערות", target: YnabCsvFields.MEMO},
        {source: "סכום חיוב", target: YnabCsvFields.OUTFLOW},
    ];
    _jsonMapping: { [key in YnabCsvFields]: string } = {
        [YnabCsvFields.DATE]: "תאריך עסקה",
        [YnabCsvFields.PAYEE]: "שם בית עסק",
        [YnabCsvFields.MEMO]: "הערות",
        [YnabCsvFields.OUTFLOW]: "סכום חיוב",
    };

    constructor(kwargs: any) {
        super(kwargs);
        this._balanceField = 0;
        this._bodyRows = this.getBodyRows();
    }

    private _shouldSkipSheet(excelFile: xlsx.WorkBook, sheetIndex: number): boolean {
        const sheetName = excelFile.SheetNames[sheetIndex];
        return sheetName !== "נתוני חשבון" && sheetName !== "דוח תנועות";
    }

    private _shouldSkipRow(row: any[]): [boolean, boolean] {
        const nextLineBalanceRegex = /מאזן חשבון/;
        if (row.length === 0) return [true, false];
        const firstValue = row[0];
        if (typeof firstValue === "string" && firstValue.match(nextLineBalanceRegex))
            return [true, true];
        return [false, false];
    }

    private _getMainTableRowObject(row: any[]): { [key in YnabCsvFields]: string | number } {
        const obj: { [key in YnabCsvFields]: string | number } = {
            [YnabCsvFields.DATE]: row[0],
            [YnabCsvFields.PAYEE]: row[1],
            [YnabCsvFields.MEMO]: row[2],
            [YnabCsvFields.OUTFLOW]: -row[3],
        };
        return obj;
    };

    getBodyRows(): string[][] {
        const rows: string[][] = [];
        let file: any;
        if (this._file) {
            file = this._file.file;
        } else {
            file = this._file_path;
        }
        set_fs(fs);
        const excel_file = readFile(file);
        for (let index = 0; index < this._rawData.length; index++) {
            const data = this._rawData[index];
            const df = data[1];
            if (this._shouldSkipSheet(excel_file, index)) {
                continue;
            }
            df.dropna();
            for (let index = 0; index < df.values.length; index++) {
                const row = df.values[index];
                const [shouldSkip, isNextLineBalance] = this._should_skip_row(row);
                if (shouldSkip) {
                    if (isNextLineBalance) {
                        const nextRow = df.values[index + 1];
                        this._balanceField += parseFloat(nextRow[0].replace('₪', ""));
                    }
                    continue;
                }
                rows.push(this._getMainTableRowObject(row));
            }
        }
        return rows;
    }

    isMainTableRow(row: string[]): boolean {
        return row[1] !== "" && row[1] !== "סך חיוב בש\"ח:";
    }


    _isDate(testString: string): boolean {
        const pattern = /^\d{2}-\d{2}-\d{4}$/;
        return pattern.test(testString);
    }

    static identifyAccount(file: any, accounts: any[] | null = null): string | null {
        if (accounts === null) {
            return null;
        }
        for (const account of accounts) {
            if (account.type !== AccountTypes.MAX) {
                continue;
            }
            try {
                const df = readFile(file);
                // const account_identifier_cell_value = df.values[0][0];
                // return account_identifier_cell_value.substr(0, 4);
            } catch (e) {
                continue;
            }
        }
        return null;
    }
}