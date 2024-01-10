import Link from "next/link.js";

import {getAccounts} from "@/lib/accounts";

export default function Navigation() {
    const accounts = getAccounts();
    return (<ul>
        {accounts.map(account => <li key={account.account_id}><Link
            href={`/accounts/${account.account_id}`}>{account.account_identifier}</Link></li>)}
    </ul>)
}