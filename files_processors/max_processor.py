import datetime
import re

import pandas

import enums as enums
from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawExcelFile
from files_processors.raw_files import YnabCsvFields


class MaxProcessor(RawExcelFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs, header_row_number=3, sheet_name=[0, 1])
        self._balance_field = 0
        self._header_mapping = [HeaderMapItem(source="תאריך עסקה", target=YnabCsvFields.DATE.value),
                                HeaderMapItem(source="שם בית עסק", target=YnabCsvFields.PAYEE.value),
                                HeaderMapItem(source="הערות", target=YnabCsvFields.MEMO.value),
                                HeaderMapItem(source="סכום חיוב", target=YnabCsvFields.OUTFLOW.value), ]

        self._json_mapping = {
            YnabCsvFields.DATE_KEY.value: "תאריך עסקה",
            YnabCsvFields.PAYEE_KEY.value: "שם בית עסק",
            YnabCsvFields.MEMO_KEY.value: "הערות",
            YnabCsvFields.AMOUNT_KEY.value: "סכום חיוב",
        }

        self._body_rows = self._get_body_rows()

    @staticmethod
    def identify_account(file, accounts=None):
        for account in accounts:
            if account["type"] != enums.AccountTypes.MAX.value:
                continue
            try:
                df = pandas.read_excel(file.name, engine='openpyxl')
                account_identifier_cell_value = df.values[0][0]
                return account_identifier_cell_value[0:4]
            except IndexError as e:
                continue

    def get_balance(self):
        return round(self._balance_field, 2)

    def _get_body_rows(self):
        rows = []
        if self._file:
            file = self._file.file
        else:
            file = self._file_path
        excel_file = pandas.ExcelFile(file)
        for index, data in enumerate(self._raw_data.items()):
            _, df = data
            if self._should_skip_sheet(excel_file, index):
                continue

            df.dropna()
            for index, row in enumerate(df.values):
                should_skip, is_next_line_balance = self._should_skip_row(row)
                if should_skip:
                    if is_next_line_balance:
                        next_row = df.values[index + 1]
                        self._balance_field += float(next_row[0].replace('₪', ""))
                    continue
                rows.append(self._get_main_table_row_object(row))

        return rows

    def _is_main_table_row(self, row):
        return row[1] != "" and row[1] != "סך חיוב בש\"ח:"

    def _get_main_table_row_object(self, row):
        day, month, year = row[0].split("-")
        return {
            self._header_mapping[0].source: self._get_ynab_date(year, month, day),
            self._header_mapping[1].source: row[1],
            self._header_mapping[2].source: row[10],
            self._header_mapping[3].source: self._getYnabAmount(row[5]),
        }

    def _should_skip_row(self, row):
        is_next_row_balance = row[0] == "סך הכל"
        if not row[0] or row[0] == "סך הכל" or not self._is_date(row[0]):
            return True, is_next_row_balance
        return False, is_next_row_balance

    def _should_skip_sheet(self, excel_file, sheet_index):
        return excel_file.sheet_names[sheet_index] == "עסקאות שאושרו וטרם נקלטו"

    def _is_date(self, test_string):
        pattern = '^\d{2}-\d{2}-\d{4}$'
        return re.match(pattern, test_string)
