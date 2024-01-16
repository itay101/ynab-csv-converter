import fs from 'fs';
import csvtojson from 'csvtojson';

import FileProcessor from "@/lib/processors/base/FileProcessor";

export default class ExcelFileProcessor extends FileProcessor {
    constructor() {
        super({fileExtension: "csv"});
    }

    async readCSVFile(file) {
        return new Promise(async (resolve, reject) => {
            // Check if the file has a .csv extension
            if (!file.name.endsWith('.csv')) {
                reject(new Error('Invalid file format. Please provide a CSV file.'));
                return;
            }

            try {
                // Read the CSV file
                const buffer = await file.arrayBuffer();
                const csvContent = Buffer.from(buffer).toString('utf-8');

                // Convert CSV to JSON
                const jsonArray = await csvtojson().fromString(csvContent);

                resolve(jsonArray);
            } catch (error) {
                reject(error);
            }
        });
    }
}