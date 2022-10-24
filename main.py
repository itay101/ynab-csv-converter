import json

import requests as requests

from enums import AccountTypeToProcessor

CONFIG_FILE_PATH = "config.json"

def process_files():
    file = open(CONFIG_FILE_PATH)
    data = json.load(file)
    token = data["token"]
    budget_id = data["budget_id"]
    accounts = data["accounts"]
    transactions = []
    for account in accounts:
        processor = AccountTypeToProcessor().get_processor_by_type(account["type"])
        account_id = account["account_id"]
        file_path = account["file_path"]
        export_file_path = account["export_file_path"]
        file_processor = processor(file_path=file_path, export_file_path=export_file_path, account_id=account_id)
        transactions = [*transactions, *file_processor.get_transactions()]
    response = requests.post(f"https://api.youneedabudget.com/v1/budgets/{budget_id}/transactions", headers={"Authorization": f"Bearer {token}"},
                             json={"transactions": transactions})

    print("Status Code", response.status_code)
    print("JSON Response ", response.json())


if __name__ == '__main__':
    process_files()
