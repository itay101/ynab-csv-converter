from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawHTMLFile
from files_processors.raw_files import YnabCsvFields


class MizrahiProcessor(RawHTMLFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs, skip_row_number=6)
        self._header_mapping = [
            HeaderMapItem(source="תאריך", target=YnabCsvFields.DATE.value),
            HeaderMapItem(source="סוג תנועה", target=YnabCsvFields.PAYEE.value),
            HeaderMapItem(source="אסמכתא", target=YnabCsvFields.MEMO.value),
            HeaderMapItem(source="סכום חיוב", target=YnabCsvFields.AMOUNT_KEY.value),
        ]
        self._json_mapping = {
            YnabCsvFields.DATE_KEY.value: "תאריך",
            YnabCsvFields.PAYEE_KEY.value: "סוג תנועה",
            YnabCsvFields.MEMO_KEY.value: "אסמכתא",
            YnabCsvFields.AMOUNT_KEY.value: "סכום חיוב",
        }
        self._body_rows = self._get_body_rows()

    def _get_body_rows(self):
        rows = []
        for row in self._raw_data:
            rows.append(self._get_main_table_row_object(row))

        return rows

    def _get_main_table_row_object(self, row):
        day, month, year = self.split_date(row[0])
        amount = self.get_ynab_amount(float(row[3] or row[4]), outflow=(row[3] == ''))
        return {
            self._header_mapping[0].source: self.get_ynab_date(2000 + int(year), month, day),
            self._header_mapping[1].source: row[2],
            self._header_mapping[2].source: row[6],
            self._header_mapping[3].source: amount,
        }
