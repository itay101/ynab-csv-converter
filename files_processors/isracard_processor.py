from files_processors.raw_files import HeaderMapItem
from files_processors.raw_files import RawExcelFile
from files_processors.raw_files import YnabCsvFields


class IsracardProcessor(RawExcelFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs, header_row_number=5)
        common_mapping = [
            HeaderMapItem(source="שם בית עסק", target=YnabCsvFields.PAYEE.value),
            HeaderMapItem(source="פירוט נוסף", target=YnabCsvFields.MEMO.value),
            HeaderMapItem(source="סכום חיוב", target=YnabCsvFields.OUTFLOW.value),
        ]
        self._header_mapping = [HeaderMapItem(source="תאריך רכישה", target=YnabCsvFields.DATE.value), *common_mapping]
        self._secondary_header_mapping = [HeaderMapItem(source="תאריך חיוב", target=YnabCsvFields.DATE.value),
                                          *common_mapping]
        self._body_rows = self._get_body_rows()

    def _get_body_rows(self):
        rows = []
        is_secondary_table = False
        data_frame_no_na = self._raw_data.dropna()
        for row in data_frame_no_na.values:
            if not is_secondary_table and self._is_main_table_row(row):
                rows.append(self._get_main_table_row_object(row))
            elif is_secondary_table or self._is_secondary_table(row):
                is_secondary_table = True
                if self._should_skip_row(row):
                    continue
                rows.append(self._get_secondary_table_row_object(row))

        return rows

    def _is_main_table_row(self, row):
        return row[1] != "" and row[1] != "סך חיוב בש\"ח:"

    def _is_secondary_table(self, row):
        return row[0] == "עסקאות בחו˝ל"

    def _get_main_table_row_object(self, row):
        return {
            self._header_mapping[0].source: row[0],
            self._header_mapping[1].source: row[1],
            self._header_mapping[2].source: row[7] if row[7] != "nan" else "",
            self._header_mapping[3].source: row[4],
        }

    def _get_secondary_table_row_object(self, row):
        return {
            self._header_mapping[0].source: row[1],
            self._header_mapping[1].source: row[2],
            self._header_mapping[2].source: row[7],
            self._header_mapping[3].source: row[5],
        }

    def _should_skip_row(self, row):
        if not row[0] or row[0] == "תאריך רכישה" or row[0] == "עסקאות בחו˝ל":
            return True
        return False
