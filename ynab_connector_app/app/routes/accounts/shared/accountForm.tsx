import type {ActionArgs} from "@remix-run/node";
import {json, LoaderArgs, redirect} from "@remix-run/node";
import {Form, useActionData, useLoaderData} from "@remix-run/react";
import * as React from "react";

import {createAccount, getAccountListItems} from "~/models/account.server";
import {requireUserId} from "~/session.server";

import {getUserById} from "~/models/user.server";
import {getAccountsByBudgetId, getBudgets} from "utils/ynabApi";
import {useEffect, useMemo, useState} from "react";
import {useOptionalUser} from "~/utils";
import {FORM_FIELDS, INPUT_FIELDS} from "~/utils/accountsUtils";
import {decrypt} from "../../../../utils/encryptionUtils";

const ACCOUNT_ID_DATA_FIELD = "accountId"
const ACCOUNT_IDENTIFIER_DATA_FIELD = "accountIdentifier"
const BUDGET_ID_DATA_FIELD = "budgetId"
const TYPE_DATA_FIELD = "type"
const USERNAME_DATA_FIELD = "username"
const PASSWORD_DATA_FIELD = "password"
const SIX_LAST_DIGITS_DATA_FIELD = "sixLastDigits"

function validateForm(formData) {
  for (const index in FORM_FIELDS) {
    const field = FORM_FIELDS[index]
    const value = formData.get(field.actionDataField)
    if (typeof value !== "string" || value.length === 0) {
      field['error'] = json(
          {errors: {title: `${field.label} is required`, body: null}},
          {status: 400}
      );
    }
  }
}

export async function loader({request}: LoaderArgs) {
  const userId = await requireUserId(request);
  const accountListItems = await getAccountListItems({userId});
  const user = await getUserById(userId)
  if (!!user && !user.ynabToken) {
    return redirect('/newToken')
  }

  const budgets = await getBudgets(decrypt(JSON.parse(user?.ynabToken as any)))
  return json({budgets});
}

export async function action({request}: ActionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const invalidInput = validateForm(formData)
  if (invalidInput) {
    return invalidInput
  }
  const budgetId = formData.get(BUDGET_ID_DATA_FIELD)
  const accountId = formData.get(ACCOUNT_ID_DATA_FIELD)
  const accountIdentifier = formData.get(ACCOUNT_IDENTIFIER_DATA_FIELD)
  const type = formData.get(TYPE_DATA_FIELD)
  const username = formData.get(USERNAME_DATA_FIELD)
  const password = JSON.stringify(encrypt(formData.get(PASSWORD_DATA_FIELD) as string))
  const cardLastDigits = parseInt(formData.get(SIX_LAST_DIGITS_DATA_FIELD))

  const account = await createAccount({
    userId, budgetId, accountId, type, password, username, cardLastDigits, accountIdentifier}
  )
  return redirect(`/accounts/${account.id}`);
}

export function getOptionsForSelect(list: any, selectionType: string) {
  const options = [{display: `Please select a ${selectionType}`, value: ''}]
  return [...options, ...list.map((item: any) => ({display: item.name, value: item.id}))]
}

export default function AccountForm({account}) {
  const user = useOptionalUser();
  const actionData = useActionData<typeof action>();
  const {budgets} = useLoaderData<typeof loader>();
  const [selectedBudget, setSelectedBudget] = useState(budgets[0])
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(accounts[0])

  useEffect(() => {
    if (selectedBudget) {
      getAccountsByBudgetId(user.ynabToken, selectedBudget.id).then(setAccounts)

    }
  }, [selectedBudget])

  return (
      <Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
      >
        <Select
            actionData={actionData}
            label="Budgets:"
            options={getOptionsForSelect(budgets, "budget")}
            actionDataField={BUDGET_ID_DATA_FIELD}
            onChange={(budgetId) => setSelectedBudget(budgets.find(budget => budget.id === budgetId))}
        />
        {accounts && <Select
            actionData={actionData}
            label="Accounts:"
            options={getOptionsForSelect(accounts, "account")}
            actionDataField={ACCOUNT_ID_DATA_FIELD}
            onChange={(accountId) => setSelectedAccount(accounts.find(account => account.id === accountId))}
        />}
        {selectedAccount && FORM_FIELDS.map((field) => {
          const {actionDataField, label} = field;
          if (field.field === INPUT_FIELDS.INPUT) {
            const {fieldType = "text"} = field;
            return (
                <Input
                    actionData={actionData}
                    actionDataField={actionDataField}
                    label={label}
                    type={fieldType}
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
  );
}
