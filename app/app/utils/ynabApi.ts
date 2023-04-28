async function getBudgets(accessToken: string) {
    try {
        const res = await fetch('https://api.ynab.com/v1/budgets', {
            headers: getHeaders(accessToken)
        })
        const {data} = await res.json()
        return data.budgets
    } catch (e) {
        console.log(e.message);
    }
}

function getHeaders(accessToken: string) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`)

    return myHeaders
}

export async function getDefaultBudget(accessToken: string) {
    const budgets = await getBudgets(accessToken)
    let defaultBudget = budgets[0];
    for (let index = 1; index < budgets.length; index++) {
        const budget = budgets[index]
        const budgetLastModified = new Date(budget.last_modified_on)
        if (budgetLastModified > new Date(defaultBudget.last_modified_on)) {
            defaultBudget = budget
        }
    }

    return defaultBudget;
}

export async function getAccounts(accessToken: string, budget: any) {
    const res = await fetch(`https://api.ynab.com/v1/budgets/${budget.id}/accounts`, {
        headers: getHeaders(accessToken)
    })
    const {data} = await res.json()
    return data.accounts
}