
def get_account_config_by_identifier(accounts, identifier):
    for account in accounts:
        if account["account_identifier"] == identifier:
            return account

    return None