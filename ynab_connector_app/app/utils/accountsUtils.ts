import {getAccountsByBudgetId} from "../../utils/ynabApi";

export const ACCOUNT_ID_DATA_FIELD = "accountId"
export const ACCOUNT_IDENTIFIER_DATA_FIELD = "accountIdentifier"
export const BUDGET_ID_DATA_FIELD = "budgetId"
export const TYPE_DATA_FIELD = "type"
export const USERNAME_DATA_FIELD = "username"
export const PASSWORD_DATA_FIELD = "password"
export const SIX_LAST_DIGITS_DATA_FIELD = "sixLastDigits"


export const ACCOUNT_TYPES = {
    CREDIT_CARD: "creditCard",
    BANK_ACCOUNT: "bankAccount",
};

export const INPUT_FIELDS = {
    INPUT: "INPUT",
    SELECT: "SELECT",
};

//TODO Generate account type dynamically on server start #30
export const TYPE_OPTIONS: any[] = [
    {value: "max", display: "Max", type: ACCOUNT_TYPES.CREDIT_CARD},
    {value: "poalin", display: "Poalim", type: ACCOUNT_TYPES.BANK_ACCOUNT},
    {value: "isracard", display: "Isracard", type: ACCOUNT_TYPES.CREDIT_CARD},
];

export const FORM_FIELDS = [
    {
        field: INPUT_FIELDS.INPUT,
        actionDataField: ACCOUNT_IDENTIFIER_DATA_FIELD,
        label: "Identifier:",
    },
    {
        field: INPUT_FIELDS.SELECT,
        actionDataField: TYPE_DATA_FIELD,
        label: "Type:",
        options: TYPE_OPTIONS,
    },
    {
        field: INPUT_FIELDS.INPUT,
        actionDataField: USERNAME_DATA_FIELD,
        label: "Username:",
    },
    {
        field: INPUT_FIELDS.INPUT,
        fieldType: "password",
        actionDataField: PASSWORD_DATA_FIELD,
        label: "Password:",
    },
    {
        field: INPUT_FIELDS.INPUT,
        fieldType: "number",
        actionDataField: SIX_LAST_DIGITS_DATA_FIELD,
        label: "6 last digits:",
    },
];

export async function getYnabAccountsByBudgetIds(user, accountListItems) {
    const budgetIds = new Set(accountListItems.map(item => item.budgetId));
    const ynabAccountsByBudgetId: any = {};
    await Promise.all(Array.from(budgetIds).map(async (budgetId) => {
        ynabAccountsByBudgetId[budgetId] = await getAccountsByBudgetId(user.ynabToken, budgetId);
    }))
    return ynabAccountsByBudgetId
}

export async function getYnabAcccountByAccount(user, storedAccount) {
    let account;
    await getYnabAccountsByBudgetIds(user, [storedAccount]).then(ynabAccountsByBudgetIds => {
        const ynabaccounts = ynabAccountsByBudgetIds[storedAccount.budgetId]
        account = ynabaccounts.find((ynabAccount) => ynabAccount.id === storedAccount.accountId)
    })
    return account;
}