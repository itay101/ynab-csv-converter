import json
import os

from common.utils import ynab_api
from common.utils import config_api
from enums import AccountTypeToProcessor
from enums import AccountTypes
from files_processors.raw_files import RawCSVFile

CONFIG_FILE_PATH = "config.json"
VALID_EXTENSIONS = (".csv", ".xls", ".xlsx")

def process_files():
    config_file = open(CONFIG_FILE_PATH)
    config_data = json.load(config_file)
    accounts = config_data["accounts"]
    transactions = []
    files_added = []
    for _root, _dirs, files in os.walk("./"):
        for filename in files:
            if filename.endswith(VALID_EXTENSIONS):
                f = open(filename, 'r')
                transactions = [*transactions, *_get_transactions_from_file(accounts, f, filename)]
                files_added.append(filename)
                f.close()
                os.remove(filename)
    if transactions:
        token = config_data["token"]
        budget_id = config_data["budget_id"]
        ynab_api.create_transactions(token, budget_id, transactions)


def _get_transactions_from_file(accounts, f, filename):
    for processor in AccountTypeToProcessor().get_processors():
        identifier = processor.identify_account(f)
        if identifier:
            config = config_api.get_account_config_by_identifier(accounts, identifier)
            if not config:
                continue
            try:
                file_processor = processor(file_path=filename, account_id=config["account_id"])
                return file_processor.get_transactions()
            except FileNotFoundError as e:
                print(f"{e.strerror}: {e.filename} ")

    return []


if __name__ == '__main__':
    process_files()
