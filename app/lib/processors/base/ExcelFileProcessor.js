
import {readFile as readXLSXFile} from 'xlsx';
import {readFile as readXLSFile} from 'xlsjs';

import FileProcessor from "@/lib/processors/base/FileProcessor";

export default class ExcelFileProcessor extends FileProcessor {
    constructor(fileExtension = "xlsx") {
        super({fileExtension});
    }

    async getCellValue(file, sheetName, row, column) {
        const fileBuffer = await file.arrayBuffer();
        let workbook;

        if (this.fileExtension === "xlsx") {
            workbook =  await readXLSXFile(fileBuffer);
        } else {
            workbook = await readXLSFile(fileBuffer);
        }

        if (!sheetName) {
            sheetName = workbook.SheetNames[0]
        }

        const worksheet = workbook.Sheets[sheetName];
        const cell = worksheet[`${column}${row}`];

        return cell?.v;
    }
}