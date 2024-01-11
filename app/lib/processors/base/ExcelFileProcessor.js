import {readFile as readXLSXFile} from 'xlsx';
import {readFile as readXLSFile} from 'xlsjs';

import FileProcessor from "@/lib/processors/base/FileProcessor";

export default class ExcelFileProcessor extends FileProcessor {
    constructor(fileExtension = "xlsx") {
        super({fileExtension});
    }

    async readExcelFile(file) {
        const fileBuffer = await file.arrayBuffer();

        if (this.fileExtension === "xlsx") {
            return readXLSXFile(fileBuffer);
        }

        return readXLSFile(fileBuffer);
    }

    async getCellValue(file, sheetName, row, column) {
        const workbook = await this.readExcelFile(file);

        if (!sheetName) {
            sheetName = workbook.SheetNames[0]
        }

        const worksheet = workbook.Sheets[sheetName];
        const cell = worksheet[`${column}${row}`];

        return cell?.v;
    }
}