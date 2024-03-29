import pandas
import re

import enums as enums
from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawExcelFile
from files_processors.raw_files import YnabCsvFields

VALUES_IN_FIRST_CELL_TO_SKIP = [
    "תאריך רכישה",
    "עסקאות בחו˝ל",
    "דביט VISA ",
    'אין נתונים להצגה'
]


class IsracardProcessor(RawExcelFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs, header_row_number=5)
        common_mapping = [
            HeaderMapItem(source="שם בית עסק", target=YnabCsvFields.PAYEE.value),
            HeaderMapItem(source="פירוט נוסף", target=YnabCsvFields.MEMO.value),
            HeaderMapItem(source="סכום חיוב", target=YnabCsvFields.OUTFLOW.value),
        ]
        self._balance_field = 0
        self._header_mapping = [HeaderMapItem(source="תאריך רכישה", target=YnabCsvFields.DATE.value), *common_mapping]
        self._json_mapping = {
            YnabCsvFields.DATE_KEY.value: "תאריך רכישה",
            YnabCsvFields.PAYEE_KEY.value: "שם בית עסק",
            YnabCsvFields.MEMO_KEY.value: "פירוט נוסף",
            YnabCsvFields.AMOUNT_KEY.value: "סכום חיוב",
        }
        self._secondary_header_mapping = [HeaderMapItem(source="תאריך חיוב", target=YnabCsvFields.DATE.value),
                                          *common_mapping]
        self._body_rows = self._get_body_rows()

    @staticmethod
    def identify_account(file, accounts=[]):
        for account in accounts:
            if account["type"] != enums.AccountTypes.ISRACARD.value:
                continue
            df = pandas.read_excel(file.name)
            try:
                account_identifier_cell_value = df.values[2][0]
                account_identifier = account_identifier_cell_value.split(" - ")[1]
                return account_identifier
            except IndexError as e:
                continue

    def get_balance(self):
        return self._balance_field

    def _get_body_rows(self):
        rows = []
        is_secondary_table = False
        for sheet_name, sheet in self._raw_data.items():
            data_frame_no_na = sheet.dropna()
            for row in data_frame_no_na.values:
                try:
                    if not is_secondary_table and self._is_main_table_row(row):
                        rows.append(self._get_main_table_row_object(row))
                    elif is_secondary_table or self._is_secondary_table(row):
                        is_secondary_table = True
                        if self._should_skip_row(row):
                            continue
                        rows.append(self._get_secondary_table_row_object(row))
                except Exception as e:
                    continue
        return rows

    def _is_main_table_row(self, row):
        return row[1] != "" and row[1] != "סך חיוב בש\"ח:"

    def _is_secondary_table(self, row):
        if row[1] == "סך חיוב בש\"ח:":
            self._balance_field = row[4]
        return row[0] == "עסקאות בחו˝ל"

    def _get_main_table_row_object(self, row):
        day, month, year = self._split_date(row[0])
        return {
            self._header_mapping[0].source: self._get_ynab_date(year, month, day),
            self._header_mapping[1].source: row[1],
            self._header_mapping[2].source: row[7],
            self._header_mapping[3].source: self._getYnabAmount(row[4]),
        }

    def _get_secondary_table_row_object(self, row):
        day, month, year = self._split_date(row[0])
        return {
            self._header_mapping[0].source: self._get_ynab_date(year, month, day),
            self._header_mapping[1].source: row[2],
            self._header_mapping[2].source: row[7],
            self._header_mapping[3].source: self._getYnabAmount(row[5]),
        }

    def _should_skip_row(self, row):
        if not row[0] or any(
                self._match_value_in_first_cell_to_skip(item, row[0]) for item in VALUES_IN_FIRST_CELL_TO_SKIP):
            return True
        return False

    def _match_value_in_first_cell_to_skip(self, skip_value, cell_value):
        match = re.search(skip_value, cell_value)
        return match

    def _split_date(self, value):
        return value.split("/")
