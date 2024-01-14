import {getLocalConfigFile} from "@/lib/accounts.js";

const BASE_URL = "https://api.youneedabudget.com/v1"
const BUDGETS_URL = `${BASE_URL}/budgets`

export async function getAccountYnabConfigById(id) {
    const {token, budget_id} = getLocalConfigFile();
    const response = await fetch(`${BUDGETS_URL}/${budget_id}/accounts`, {
        headers: {"Authorization": `Bearer ${token}`}
    })
    const {data} = await response.json()
    return data.accounts.find(account => account.id === id)

}

export async function sendTransactionsToYnab(token, budgetId, transactions) {
    return await fetch(`${BUDGETS_URL}/${budgetId}/transactions/`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'},
        body: JSON.stringify({transactions})
    })
}