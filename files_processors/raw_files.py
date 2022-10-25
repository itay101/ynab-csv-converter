import csv
import datetime
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
    DATE_KEY = "date"
    PAYEE_KEY = "payee_name"
    MEMO_KEY = "memo"
    AMOUNT_KEY = "amount"


class RawFile:
    def __init__(self, file_path, export_file_path, account_id):
        self._file_path = file_path
        self._export_file_path = f"export/{export_file_path}"
        self._account_id = account_id
        self._header_mapping = []
        self._json_mapping = {}
        self._body_rows = []

    def write_csv_file(self):
        os.makedirs(os.path.dirname(self._export_file_path), exist_ok=True)
        with open(os.path.expandvars(self._export_file_path), 'w') as file:
            writer = csv.writer(file)
            writer.writerow([column_map_item.target for column_map_item in self._header_mapping])
            for row in self._body_rows:
                writer.writerow([row[column_map_item.source] for column_map_item in self._header_mapping])
        file.close()

    def split_date(self, value):
        return value.split("/")

    def get_transactions(self):
        transactions = []
        for row in self._body_rows:
            transactions.append(self._get_json(row))
        return transactions

    def get_ynab_date(self, year, month, day):
        return datetime.datetime(int(year), int(month), int(day), 0, 0).strftime('%Y-%m-%d')

    def get_ynab_amount(self, value, outflow=True):
        amount = int(value * 1000)
        if outflow:
            return amount * -1
        return amount

    def _get_json(self, row):
        amount = row[self._json_mapping[YnabCsvFields.AMOUNT_KEY.value]]
        date = row[self._json_mapping[YnabCsvFields.DATE_KEY.value]]
        return {
            "account_id": self._account_id,
            "date": date,
            "amount": amount,
            "payee_name": row[self._json_mapping[YnabCsvFields.PAYEE_KEY.value]],
            "memo": row[self._json_mapping[YnabCsvFields.MEMO_KEY.value]],
            "import_id": f"YNAB:{amount}:{date}:1",
            "cleared": "cleared",
            "approved": False,

        }


class RawExcelFile(RawFile):
    def __init__(self, header_row_number, sheet_name=[0], **kwargs):
        super().__init__(**kwargs)
        self._header_row_number = header_row_number
        self._sheet_name = sheet_name
        self._raw_data = self._get_file_raw_data()

    def _get_file_raw_data(self):
        excel_file = pandas.ExcelFile(self._file_path)

        if self._sheet_name:
            dfs = pandas.read_excel(self._file_path, header=self._header_row_number, sheet_name=excel_file.sheet_names)
            sheets = {}
            for key, sheet in dfs.items():
                sheets[key] = sheet.replace(np.nan, '', regex=True)
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


class RawHTMLFile(RawFile):
    def __init__(self, skip_row_number, **kwargs):
        super().__init__(**kwargs)
        self._skip_row_number = skip_row_number
        self._raw_data = self._get_file_raw_data()

    def _get_file_raw_data(self):
        rows = []
        data = pandas.read_html(self._file_path,
                                skiprows=self._skip_row_number,
                                encoding='utf-8',
                                keep_default_na=False)
        for d in data[0].values:
            if d[0] == '':
                break
            rows.append(d)
        return rows
