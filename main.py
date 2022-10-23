import requests as requests

from files_processors.isracard_processor import IsracardProcessor
from files_processors.max_processor import MaxProcessor
from files_processors.poalim_processor import PoalimProcessor

BUDGET_ID = "XXXXX"
TOKEN = "XXXXX"

FILES = [
    PoalimProcessor(file_path="example.csv", export_file_path="example.csv"),
    IsracardProcessor(file_path="example.xls", export_file_path="example.csv"),
    MaxProcessor(file_path="example.xlsx", export_file_path="example.csv")
]


def process_files():
    transactions = []
    for file in FILES:
        transactions = [*transactions, *file.get_transactions()]
    response = requests.post(f"https://api.youneedabudget.com/v1/budgets/{BUDGET_ID}/transactions", headers={"Authorization": f"Bearer {TOKEN}"},
                             json={"transactions": transactions})

    print("Status Code", response.status_code)
    print("JSON Response ", response.json())


if __name__ == '__main__':
    process_files()
