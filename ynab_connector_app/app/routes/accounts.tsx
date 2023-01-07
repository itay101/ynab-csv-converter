import type {LoaderArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, Link, NavLink, Outlet, useLoaderData} from "@remix-run/react";

import {requireUserId} from "~/session.server";
import {useUser} from "~/utils";
import {getAccountListItems} from "~/models/account.server";
import {getUserById} from "~/models/user.server";
import {getYnabAccountsByBudgetIds} from "~/utils/accountsUtils";

export async function loader({request}: LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId)
  if (!!user && !user.ynabToken) {
    return redirect('/newToken')
  }
  const accounts = await getAccountListItems({userId});
  const ynabAccountsByBudgetId = await getYnabAccountsByBudgetIds(user, accounts);
  const accountListItems = accounts.map(account => ({
    ...account,
    ...ynabAccountsByBudgetId[account.budgetId].find(ynabAccount => ynabAccount.id === account.accountId)
  }))
  return json({accountListItems});
}

export default function AccountsPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
      <div className="flex h-full min-h-screen flex-col">
        <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
          <h1 className="text-3xl font-bold">
            <Link to=".">Accounts</Link>
          </h1>
          <p>{user.email}</p>
          <Form action="/logout" method="post">
            <button
                type="submit"
                className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        </header>

        <main className="flex h-full bg-white">
          <div className="h-full w-80 border-r bg-gray-50">
            <Link to="new" className="block p-4 text-xl text-blue-500">
              + New Account
            </Link>

            <hr/>

            {data.accountListItems.length === 0 ? (
                <p className="p-4">No Accounts yet</p>
            ) : (
                <ol>
                  {data.accountListItems.map((account) => (
                      <li key={account.id}>
                        <NavLink
                            className={({isActive}) =>
                                `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                            }
                            to={account.id}
                        >
                          📝 {account.name}
                        </NavLink>
                      </li>
                  ))}
                </ol>
            )}
          </div>

          <div className="flex-1 p-6">
            <Outlet/>
          </div>
        </main>
      </div>
  );
}
