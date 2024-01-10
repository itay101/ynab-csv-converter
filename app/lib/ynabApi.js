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