import RawFile from "~/utils/filesProcessors/rawFiles/RawFile";

export default class RawExcelFile extends RawFile {
    _headerRowNumber: number;
    _sheetName: string[];
    _rawData: any;
    _contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    constructor(header_row_number: number, sheet_name: string[] = [0], kwargs: any = {}) {
        super(kwargs);
        this._headerRowNumber = header_row_number;
        this._sheetName = sheet_name;
        this._rawData = this._getFileRawData();
    }

    private _getFileRawData(): any {
        let excel_file: any;
        if (this._file) {
            excel_file = pandas.ExcelFile(this._file.file);
        } else {
            excel_file = pandas.ExcelFile(this._filePath);
        }

        if (this._sheetName) {
            let file: any;
            if (this._file) {
                file = this._file.file;
            } else {
                file = this._filePath;
            }

            const dfs = pandas.read_excel(file, {header: this._headerRowNumber, sheet_name: excel_file.sheet_names});
            const sheets: any = {};
            for (const [key, sheet] of Object.entries(dfs)) {
                sheets[key] = sheet.replace(/NaN/g, '', {regex: true});
            }
            return sheets;
        }

        const df = pandas.read_excel(this._filePath, {header: this._headerRowNumber, sheet_name: this._sheetName});
        return df.replace(/NaN/g, '', {regex: true});
    }
}
