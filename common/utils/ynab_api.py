from typing import Dict

import requests as requests

BASE_URL = "https://api.youneedabudget.com/v1"
BUDGETS_URL = f"{BASE_URL}/budgets/"


def create_transactions(token, budget_id, transactions):
    transactions_url = f"{BUDGETS_URL}{budget_id}/transactions"
    response = requests.post(transactions_url, headers={"Authorization": f"Bearer {token}"},
                             json={"transactions": transactions})
    response_json = response.json()
    if "error" in response_json:
        print(response_json["error"])
    return {"imported": len(response_json["data"]['transaction_ids']),
            "duplicated": len(response_json["data"]['duplicate_import_ids'])}
