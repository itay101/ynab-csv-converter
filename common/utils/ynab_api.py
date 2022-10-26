import requests as requests

BASE_URL = "https://api.youneedabudget.com/v1"
BUDGETS_URL = f"{BASE_URL}/budgets/"


def create_transactions(token, budget_id, transactions):
    transactions_url = f"{BUDGETS_URL}{budget_id}/transactions"
    response = requests.post(transactions_url, headers={"Authorization": f"Bearer {token}"},
                             json={"transactions": transactions})
    print("Status Code", response.status_code)
    print("JSON Response ", response.json())
