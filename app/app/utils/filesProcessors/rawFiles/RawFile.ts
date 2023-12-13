import fs from "fs";
import path from "path";
import * as csv from "csv";

export enum YnabCsvFields {
    DATE = "Date",
    PAYEE = "Payee",
    MEMO = "Memo",
    OUTFLOW = "Outflow",
    INFLOW = "Inflow",
    DATE_KEY = "date",
    PAYEE_KEY = "payee_name",
    MEMO_KEY = "memo",
    AMOUNT_KEY = "amount",
}

export interface ColumnMapItem {
    source: string;
    target: string;
}

interface JsonMapping {
    [key: string]: string;
}

interface Transaction {
    account_id: string;
    date: string;
    amount: number;
    payee_name: string;
    memo: string;
    import_id: string;
    cleared: string;
    approved: boolean;
}

export interface HeaderMapItem {
    source: string;
    target: string;
}

interface RawFileArguments {
    file_path: string,
    export_file_path: string,
    account_id: string,
    file: File
}

export default class RawFile {
    _file: any;
    _filePath: string;
    _exportFilePath: string;
    _contentType: string;
    _accountId: string;
    _headerMapping: ColumnMapItem[];
    _jsonMapping: JsonMapping;
    _bodyRows: any[];

    constructor({file_path, export_file_path, account_id, file}: RawFileArguments) {
        this._file = file;
        this._filePath = file_path;
        this._exportFilePath = `export/${export_file_path}`;
        this._accountId = account_id;
        this._headerMapping = [];
        this._jsonMapping = {};
        this._bodyRows = [];
        this._contentType = '';
    }

    writeCsvFile(): void {
        fs.mkdirSync(path.dirname(this._exportFilePath), {recursive: true});
        const writer = csv.writer({sendHeaders: false});
        writer.pipe(fs.createWriteStream(path.resolve(this._exportFilePath)));
        writer.write(this._headerMapping.map(column_map_item => column_map_item.target));
        for (const row of this._bodyRows) {
            writer.write(this._headerMapping.map(column_map_item => row[column_map_item.source]));
        }
        writer.end();
    }

    getBalance(): number {
        return 0;
    }

    get_transactions(): Transaction[] {
        const transactions: Transaction[] = [];
        for (const row of this._bodyRows) {
            transactions.push(this._get_json(row));
        }
        return transactions;
    }

    isValidContentType(content_type: string): boolean {
        return content_type === this._contentType;
    }

    private _get_json(row: any): Transaction {
        const amount = row[this._jsonMapping[YnabCsvFields.AMOUNT_KEY]];
        const date = row[this._jsonMapping[YnabCsvFields.DATE_KEY]];
        return {
            account_id: this._accountId,
            date: date,
            amount: this._getYnabAmount(amount),
            payee_name: row[this._jsonMapping[YnabCsvFields.PAYEE_KEY]],
            memo: row[this._jsonMapping[YnabCsvFields.MEMO_KEY]],
            import_id: `YNAB:${amount}:${date}:1`,
            cleared: 'cleared',
            approved: false,
        };
    }

    _getYnabDate(year: number, month: number, day: number): string {
        return new Date(year, month - 1, day).toISOString().slice(0, 10);
    }

    _getYnabAmount(value: number, outflow: boolean = true): number {
        const amount = Math.round(value * 1000);
        return outflow ? -amount : amount;
    }
}
