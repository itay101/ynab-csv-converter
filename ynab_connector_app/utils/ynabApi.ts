import axios from 'axios'
const BASE_URL = "https://api.youneedabudget.com/v1"
const BUDGETS_URL = `${BASE_URL}/budgets/`

export async function getBudgets(token: string) {
    token = '85edcb6a16dbca247b161e60313367f159f7ff8ad74066d43ecfad5e4e98c759'
    const {data} = await axios.get(BUDGETS_URL, {headers: {"Authorization": `Bearer ${token}`}})
    return data.data.budgets
}

export async function getAccountsByBudgetId(token: string, budgetId: string) {
    token = '85edcb6a16dbca247b161e60313367f159f7ff8ad74066d43ecfad5e4e98c759'
    const {data} = await axios.get(`${BUDGETS_URL}/${budgetId}/accounts`, {headers: {"Authorization": `Bearer ${token}`}})
    return data.data.accounts
}