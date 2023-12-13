import * as pandas from "pandas";
import {AccountTypes} from "./enums";
import type {HeaderMapItem} from "./rawFiles";
import {RawExcelFile, YnabCsvFields,} from "./rawFiles";

export class IsracardProcessor extends RawExcelFile {
  private _balanceField: number = 0;
  _headerMapping: HeaderMapItem[] = [
    {source: "תאריך רכישה", target: YnabCsvFields.DATE},
    {source: "שם בית עסק", target: YnabCsvFields.PAYEE},
    {source: "פירוט נוסף", target: YnabCsvFields.MEMO},
    {source: "סכום חיוב", target: YnabCsvFields.OUTFLOW}
  ];
  _jsonMapping: { [key: string]: string } = {
    [YnabCsvFields.DATE_KEY]: "תאריך רכישה",
    [YnabCsvFields.PAYEE_KEY]: "שם בית עסק",
    [YnabCsvFields.MEMO_KEY]: "פירוט נוסף",
    [YnabCsvFields.AMOUNT_KEY]: "סכום חיוב",
  };
  _secondaryHeaderMapping: HeaderMapItem[] = [
    {source: "תאריך חיוב", target: YnabCsvFields.DATE},
    {source: "שם בית עסק", target: YnabCsvFields.PAYEE},
    {source: "פירוט נוסף", target: YnabCsvFields.MEMO},
    {source: "סכום חיוב", target: YnabCsvFields.OUTFLOW},
  ];
  _bodyRows = [];

  constructor(kwargs: any) {
    super(kwargs, 5);
    this._balanceField = 0;
    this._bodyRows = this._getBodyRows();
  }

  public static identifyAccount(file: any, accounts: any[]): string {
    for (const account of accounts) {
      if (account.type !== AccountTypes.ISRACARD) {
        continue;
      }
      const df = pandas.read_excel(file.name);
      try {
        const accountIdentifierCellValue = df.values[2][0];
        return accountIdentifierCellValue.split(" - ")[1];
      } catch (e) {
        continue;
      }
    }
    return "";
  }

  public getBalance(): number {
    return this._balanceField;
  }

  private _getBodyRows() {
    const rows = [];
    let isSecondaryTable = false;

    for (const [sheetName, sheet] of Object.entries(this._rawData)) {
      const dataFrameNoNa = sheet.dropna();
      for (const row of dataFrameNoNa.values) {
        if (!isSecondaryTable && this._isMainTableRow(row)) {
          rows.push(this._getMainTableRowObject(row));
        } else if (isSecondaryTable || this._isSecondaryTable(row)) {
          isSecondaryTable = true;
          if (this._shouldSkipRow(row)) {
            continue;
          }
          rows.push(this._getSecondaryTableRowObject(row));
        }
      }
    }
    return rows;
  }

  private _isMainTableRow(row: any[]): boolean {
    return row[1] !== "" && row[1] !== "סך חיוב בש\"ח:";
  }

  private _isSecondaryTable(row: any[]): boolean {
    if (row[1] === "סך חיוב בש\"ח:") {
      this._balanceField = row[4];
    }
    return row[0] === "עסקאות בחו˝ל";
  }

  private _getMainTableRowObject(row: any[]): object {
    const [day, month, year] = this._splitDate(row[0]);
    return {
      [this._headerMapping[0].source]: this._getYnabDate(parseInt(year), parseInt(month), parseInt(day)),
      [this._headerMapping[1].source]: row[1],
      [this._headerMapping[2].source]: row[7],
      [this._headerMapping[3].source]: this._getYnabAmount(row[4]),
    };
  }

  private _getSecondaryTableRowObject(row: any[]): object {
    const [day, month, year] = this._splitDate(row[1]);
    return {
      [this._headerMapping[0].source]: this._getYnabDate(parseInt(year), parseInt(month), parseInt(day)),
      [this._headerMapping[1].source]: row[2],
      [this._headerMapping[2].source]: row[7],
      [this._headerMapping[3].source]: this._getYnabAmount(row[5]),
    };
  }

  private _shouldSkipRow(row: any[]): boolean {
    return !row[0] || row[0] === "תאריך רכישה" || row[0] === "עסקאות בחו˝ל";

  }

  private _splitDate(value: string): string[] {
    return value.split("/");
  }
}
