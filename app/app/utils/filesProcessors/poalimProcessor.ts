import RawCSVFile from "~/utils/filesProcessors/rawFiles/RawCSVFile";
import {YnabCsvFields} from "~/utils/filesProcessors/rawFiles/RawFile";

const INFLOW_KEY = "זכות";
const OUTFLOW_KEY = "חובה";
const POALIM = "shekel";

export class PoalimProcessor extends RawCSVFile {
    constructor(kwargs: any) {
        super(kwargs);
        this._header_mapping = [
            new HeaderMapItem({source: "\ufeffתאריך", target: YnabCsvFields.DATE}),
            new HeaderMapItem({source: "תיאור הפעולה", target: YnabCsvFields.PAYEE}),
            new HeaderMapItem({source: "אסמכתא", target: YnabCsvFields.MEMO}),
            new HeaderMapItem({source: "סכום", target: YnabCsvFields.OUTFLOW}),
            new HeaderMapItem({source: "זכות", target: YnabCsvFields.INFLOW}),
        ];

        this._json_mapping = {
            [YnabCsvFields.DATE_KEY]: "\ufeffתאריך",
            [YnabCsvFields.PAYEE_KEY]: "תיאור הפעולה",
            [YnabCsvFields.MEMO_KEY]: "אסמכתא",
            [YnabCsvFields.AMOUNT_KEY]: "סכום",
        };

        this._balance_field = "יתרה לאחר פעולה";
        this._body_rows = this._get_body_rows();
    }

    getBalance() {
        return parseFloat(this._body_rows[this._body_rows.length - 1]["balance"]);
    }

    static identifyAccount(file: File, accounts = []) {
        if (file.name.includes(POALIM)) {
            return "poalim";
        }
        return null;
    }

    _getBodyRows() {
        return this._body_rows.map((row: any) => this._getRowObject(row));
    }

    _getRowObject(row: any) {
        const [year, month, day] = row[this._json_mapping[YnabCsvFields.DATE_KEY]].split("-");
        const outflow = row[OUTFLOW_KEY];
        const inflow = row[INFLOW_KEY];
        return {
            [this._header_mapping[0].source]: this._get_ynab_date(year, month, day),
            [this._header_mapping[1].source]: row[this._json_mapping[YnabCsvFields.PAYEE_KEY]],
            [this._header_mapping[2].source]: row[this._json_mapping[YnabCsvFields.MEMO_KEY]],
            [this._header_mapping[3].source]: this._getYnabAmount(parseFloat(outflow || inflow),
                outflow === ""),
            "balance": row[this._balance_field]
        };
    }
}

module.exports = PoalimProcessor;
