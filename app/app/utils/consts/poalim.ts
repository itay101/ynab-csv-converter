import {YnabCsvFields} from "~/utils/filesProcessors/rawFiles/RawFile";

export const TRANSLATION = {
    DATE: "\ufeffתאריך",
    PAYEE: "תיאור הפעולה",
    MEMO: "אסמכתא",
    AMOUNT: "סכום",
    INFLOW: "זכות"
}

export const JSON_MAPPING = {
    [YnabCsvFields.DATE_KEY]: TRANSLATION.DATE,
    [YnabCsvFields.PAYEE_KEY]: TRANSLATION.PAYEE,
    [YnabCsvFields.MEMO_KEY]: TRANSLATION.MEMO,
    [YnabCsvFields.AMOUNT_KEY]: TRANSLATION.AMOUNT,
}