import {getAccountLocalConfigById} from "@/lib/accounts.js";
import {getAccountYnabConfigById} from "@/lib/ynabApi.js";

export default async function AccountDetailsPage({params}) {
    const {id} = params;
    const accountLocalConfig = getAccountLocalConfigById(id);
    const ynabConfig = await getAccountYnabConfigById(id)
    return (
        <main>
            {JSON.stringify(accountLocalConfig)}
            <br/>
            {JSON.stringify(ynabConfig)}
        </main>
    )
}