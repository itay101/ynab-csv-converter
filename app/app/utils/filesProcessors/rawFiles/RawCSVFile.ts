import RawFile from "~/utils/filesProcessors/rawFiles/RawFile";
import fs from "fs";
import { parse } from 'csv-parse/sync';

interface Row {
    [key: string]: string;
}

export default class RawCSVFile extends RawFile {
    _contentType: string = 'text/csv';
    _bodyRows: Row[];

    constructor(kwargs: any) {
        super(kwargs);
        this._bodyRows = this._getFileRawData();
    }

    _getFileRawData() {
        if (this._file) {
            const records = parse(this._file);
        }

        const rows: Row[] = [];
        const fileContent = fs.readFileSync(this._filePath, 'utf-8');
        const lines = fileContent.split(/\r?\n/).slice(1);
        for (const line of lines) {
            if (line.trim() === '') {
                continue;
            }

            const row: Row = {};
            const values = line.split(',');

            for (let i = 0; i < values.length; i++) {
                row[this._headerMapping[i].source] = values[i];
            }

            rows.push(row);
        }

        return rows;
    }
}
