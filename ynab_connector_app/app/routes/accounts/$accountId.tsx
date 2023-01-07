import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, useActionData, useCatch, useLoaderData} from "@remix-run/react";
import invariant from "tiny-invariant";

import {deleteNote} from "~/models/note.server";
import {getUser, requireUserId} from "~/session.server";
import {getAccount} from "~/models/account.server";
import {
    FORM_FIELDS,
    getYnabAcccountByAccount,
    INPUT_FIELDS
} from "~/utils/accountsUtils";
import {Input, Select} from "~/components";
import * as React from "react";
import {useEffect, useState} from "react";
import {getAccountsByBudgetId, getBudgets} from "../../../utils/ynabApi";
import {decrypt} from "../../../utils/encryptionUtils";
import {useOptionalUser} from "~/utils";

export async function loader({request, params}: LoaderArgs) {
    invariant(params.accountId, "accountId not found");
    const user = await getUser(request)

    if (!user) {
        throw new Response("User not Found", {status: 404});
    }

    const storedAccount = await getAccount({userId: user.id, accountId: params.accountId});
    if (!storedAccount) {
        throw new Response("Account not Found", {status: 404});
    }
    const ynabAccount = await getYnabAcccountByAccount(user, storedAccount)
    const budgets = await getBudgets(decrypt(JSON.parse(user?.ynabToken as any)))
    return json({account: {...ynabAccount, ...storedAccount}, budgets});
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  await deleteNote({ userId, id: params.noteId });

  return redirect("/notes");
}

export default function AccountDetailsPage() {
    const user = useOptionalUser();
    const actionData = useActionData<typeof action>();
    const {account, budgets} = useLoaderData<typeof loader>();
    const [selectedBudget, setSelectedBudget] = useState(budgets[0])
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState({display: account.name, value: account.accountId})

    useEffect(() => {
        if (selectedBudget) {
            getAccountsByBudgetId(user.ynabToken, selectedBudget.id).then(setAccounts)

        }
    }, [selectedBudget])
    return (
        <div>
            <h3 className="text-2xl font-bold">{account.name}</h3>
            <h2 className="text-l font-bold">YNAB Data</h2>
            <p className="py-6">Current Balance: {account.cleared_balance / 100} <span className='text-xs'>₪</span></p>
            <h2 className="text-l font-bold">Stored Data</h2>
            <p className="py-6">Type: {account.type}</p>
            <Form method="post">
                {selectedAccount &&
                FORM_FIELDS
                    .filter(field => !field.fieldType || field.fieldType !== 'password')
                    .map((field) => {
                        const {actionDataField, label} = field;
                        if (field.field === INPUT_FIELDS.INPUT) {
                            const {fieldType = "text"} = field;
                            return (
                                <Input
                                    actionData={actionData}
                                    actionDataField={actionDataField}
                                    label={label}
                                    type={fieldType}
                                    value={account[actionDataField]}
                                />
                            );
                        }

                        if (field.field === INPUT_FIELDS.SELECT) {
                            const {options} = field;
                            return (
                                options && (
                                    <Select
                                        actionData={actionData}
                                        actionDataField={actionDataField}
                                        label={label}
                                        options={options}
                                    />
                                )
                            );
                        }

                        return null;
                    })}

                <div className="text-right">
                    <button
                        type="submit"
                        className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                    >
                        Save
                    </button>
                </div>
            </Form>
            <hr className="my-4"/>
            <Form method="post">
                <button
                    type="submit"
                    className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                    Delete
                </button>
            </Form>
        </div>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
      return <div>{caught.data}</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
