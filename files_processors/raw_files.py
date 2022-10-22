import csv
import enum
import os
import numpy as np
from collections import namedtuple

import pandas as pandas

HeaderMapItem = namedtuple("HeaderMapItem", ["source", "target"])


class YnabCsvFields(enum.Enum):
    DATE = "Date"
    PAYEE = "Payee"
    MEMO = "Memo"
    OUTFLOW = "Outflow"
    INFLOW = "Inflow"


class RawFile:
    def __init__(self, file_path, export_file_path):
        self._file_path = file_path
        self._export_file_path = f"export/{export_file_path}"
        self._header_mapping = []
        self._body_rows = []

    def write_csv_file(self):
        os.makedirs(os.path.dirname(self._export_file_path), exist_ok=True)
        with open(os.path.expandvars(self._export_file_path), 'w') as file:
            writer = csv.writer(file)
            writer.writerow([column_map_item.target for column_map_item in self._header_mapping])
            for row in self._body_rows:
                writer.writerow([row[column_map_item.source] for column_map_item in self._header_mapping])
        file.close()


class RawExcelFile(RawFile):
    def __init__(self, header_row_number, sheet_name=[0], **kwargs):
        super().__init__(**kwargs)
        self._header_row_number = header_row_number
        self._sheet_name = sheet_name
        self._raw_data = self._get_file_raw_data()

    def _get_file_raw_data(self):
        if self._sheet_name:
            dfs = [pandas.read_excel(self._file_path, header=self._header_row_number, sheet_name=[sheet])
                      for sheet in self._sheet_name]
            sheets = []
            for sheet in dfs:
                for _key, df in sheet.items():
                    sheets.append(df.replace(np.nan, '', regex=True))
            return sheets
        df = pandas.read_excel(self._file_path, header=self._header_row_number, sheet_name=self._sheet_name)
        df2 = df.replace(np.nan, '', regex=True)
        return df2


class RawCSVFile(RawFile):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._body_rows = self._get_file_raw_data()[1]

    def _get_file_raw_data(self):
        with open(os.path.expandvars(self._file_path), 'r', encoding='utf-8') as file:
            lines = file.read().splitlines()
            reader = csv.DictReader(lines)
            return reader.fieldnames, list(reader)
