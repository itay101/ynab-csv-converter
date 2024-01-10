import ExcelJS from 'exceljs';

import FileProcessor from "@/lib/processors/base/FileProcessor";
import path from "path";
import fs from "fs";

export default class ExcelFileProcessor extends FileProcessor {
    constructor() {
        super({fileExtension: "xlsx"});
    }

    async getFileContent(file) {
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, {recursive: true});
        const tempFilePath = path.join(tempDir, `${Date.now()}_${file.name}`);

        // Move the uploaded file to the temporary location
        await fs.rename(file.path, tempFilePath);

        return tempFilePath;

        // Read and process the Excel file using exceljs
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(tempFilePath);
        const worksheet = workbook.getWorksheet(1);

        // Process the data from the worksheet
        worksheet.eachRow((row, rowNumber) => {
            console.log(`Row ${rowNumber} = ${JSON.stringify(row.values)}`);
        });

        // Clean up: Delete the temporary file
        await fs.unlink(tempFilePath);
    }

    async getCellValue(file, sheetName, row, column) {
        const fileBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(sheetName);
        const cell = worksheet.getCell(`${column}${row}`);

        return cell.value;
    }
}