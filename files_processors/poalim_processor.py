from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawCSVFile
from files_processors.raw_files import YnabCsvFields

INFLOW_KEY = "זכות"
OUTFLOW_KEY = "חובה"
POALIM = "shekel"

class PoalimProcessor(RawCSVFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._header_mapping = [
            HeaderMapItem(source="\ufeffתאריך", target=YnabCsvFields.DATE.value),
            HeaderMapItem(source="תיאור הפעולה", target=YnabCsvFields.PAYEE.value),
            HeaderMapItem(source="אסמכתא", target=YnabCsvFields.MEMO.value),
            HeaderMapItem(source="סכום", target=YnabCsvFields.OUTFLOW.value),
            HeaderMapItem(source="זכות", target=YnabCsvFields.INFLOW.value),
        ]

        self._json_mapping = {
            YnabCsvFields.DATE_KEY.value: "\ufeffתאריך",
            YnabCsvFields.PAYEE_KEY.value: "תיאור הפעולה",
            YnabCsvFields.MEMO_KEY.value: "אסמכתא",
            YnabCsvFields.AMOUNT_KEY.value: "סכום",
        }

        self._balance_field = "יתרה לאחר פעולה"
        self._body_rows = self._get_body_rows()

    def get_balance(self):
        return float(self._body_rows[-1]["balance"])

    @staticmethod
    def identify_account(file, accounts=[]):
        if POALIM in file.name:
            return "poalim"
        return None

    def _get_body_rows(self):
        return [self._getRowObject(row) for row in self._body_rows]

    def _getRowObject(self, row):
        year, month, day = self._split_date(row[self._json_mapping[YnabCsvFields.DATE_KEY.value]])
        outflow = row[OUTFLOW_KEY]
        inflow = row[INFLOW_KEY]
        return {
            self._header_mapping[0].source: self._get_ynab_date(year, month, day),
            self._header_mapping[1].source: row[self._json_mapping[YnabCsvFields.PAYEE_KEY.value]],
            self._header_mapping[2].source: row[self._json_mapping[YnabCsvFields.MEMO_KEY.value]],
            self._header_mapping[3].source: self._getYnabAmount((float(outflow or inflow)),
                                                                  outflow=inflow == ""),
            "balance": row[self._balance_field]
        }

    def _split_date(self, value):
        return value.split("-")
