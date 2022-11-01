from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawCSVFile
from files_processors.raw_files import YnabCsvFields

INFLOW_KEY = "זכות"
OUTFLOW_KEY = "חובה"


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

        self._body_rows = self._get_body_rows()

    @staticmethod
    def identify_account(file, accounts=[]):
        if "poalim" in file.name:
            return "poalim"
        return None

    def _get_body_rows(self):
        return [self._get_row_object(row) for row in self._body_rows]

    def _get_row_object(self, row):
        year, month, day = self._split_date(row[self._json_mapping[YnabCsvFields.DATE_KEY.value]])
        outflow = row[OUTFLOW_KEY]
        inflow = row[INFLOW_KEY]
        return {
            self._header_mapping[0].source: self._get_ynab_date(year, month, day),
            self._header_mapping[1].source: row[self._json_mapping[YnabCsvFields.PAYEE_KEY.value]],
            self._header_mapping[2].source: row[self._json_mapping[YnabCsvFields.MEMO_KEY.value]],
            self._header_mapping[3].source: self._get_ynab_amount((float(outflow or inflow)),
                                                                  outflow=inflow == ""),
        }

    def _split_date(self, value):
        return value.split("-")
