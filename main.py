import json
import os

from common.utils import ynab_api
from common.utils import config_api
from enums import AccountTypeToProcessor

CONFIG_FILE_PATH = "~/code/ynab-csv-converter/config.json"
VALID_EXTENSIONS = (".csv", ".xls", ".xlsx")



def process_files():
    config_file = open(os.path.expanduser(CONFIG_FILE_PATH))
    config_data = json.load(config_file)
    accounts = config_data["accounts"]
    transactions = []
    files_added = []
    for _root, _dirs, files in os.walk(os.path.expanduser("~/Downloads")):
        for filename in files:
            if filename.endswith(VALID_EXTENSIONS):
                f = open(f"{_root}/{filename}", 'r')
                print("processing:", filename)
                transactions = [*transactions, *_get_transactions_from_file(accounts, f, f"{_root}/{filename}")]
                f.close()
                files_added.append(filename)
    if transactions:
        token = config_data["token"]
        budget_id = config_data["budget_id"]
        ynab_api.create_transactions(token, budget_id, transactions)


def _get_transactions_from_file(accounts, f, filename):
    for processor in AccountTypeToProcessor().get_processors():
        try:
            identifier = processor.identify_account(f, accounts)
            if identifier:
                print(f"found identifier {identifier} for filename {filename}")
                config = config_api.get_account_config_by_identifier(accounts, identifier)
                if not config:
                    continue
                try:
                    file_processor = processor(file_path=filename, account_id=config["account_id"])
                    return file_processor.get_transactions()
                except FileNotFoundError as e:
                    print(f"{e.strerror}: {e.filename} ")
        except Exception as e:
            continue
    return []


if __name__ == '__main__':
    process_files()
