import json

import requests as requests

from enums import AccountTypeToProcessor

CONFIG_FILE_PATH = "config.json"
BASE_URL = "https://api.youneedabudget.com/v1"
BUDGETS_URL = f"{BASE_URL}/budgets/"


def process_files():
        file = open(CONFIG_FILE_PATH)
        data = json.load(file)
        token = data["token"]
        budget_id = data["budget_id"]
        accounts = data["accounts"]
        transactions_url = f"{BUDGETS_URL}{budget_id}/transactions"
        transactions = []
        files_added = []
        for account in accounts:
            processor = AccountTypeToProcessor().get_processor_by_type(account["type"])
            account_id = account["account_id"]
            file_path = account["file_path"]
            export_file_path = account["export_file_path"]
            try:
                file_processor = processor(file_path=file_path, export_file_path=export_file_path, account_id=account_id)
                transactions = [*transactions, *file_processor.get_transactions()]
                files_added.append(file_path)
            except FileNotFoundError as e:
                print(f"{e.strerror}: {e.filename} ")
        response = requests.post(transactions_url, headers={"Authorization": f"Bearer {token}"},
                                 json={"transactions": transactions})
        print("Import successfully to YNAB the following files: ", ", ".join(files_added))

        print("Status Code", response.status_code)
        print("JSON Response ", response.json())


if __name__ == '__main__':
    process_files()
