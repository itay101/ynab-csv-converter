export async function getBudgets(accessToken: string) {
    try {
        const res = await fetch('https://api.ynab.com/v1/budgets', {
            headers: getHeaders(accessToken)
        })
        const {data} = await res.json()
        return data.default_budget
    } catch (e) {
        console.log(e.message);
    }
}

function getHeaders(accessToken: string) {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`)

    return myHeaders
}

export async function getAccounts(accessToken: string, budget: any) {
    const res = await fetch(`https://api.ynab.com/v1/budgets/${budget.id}/accounts`, {
        headers: getHeaders(accessToken)
    })
    const {data} = await res.json()
    return data.accounts
}