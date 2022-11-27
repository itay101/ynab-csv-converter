import type {ActionArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, useActionData} from "@remix-run/react";
import * as React from "react";

import {createNote} from "~/models/note.server";
import {requireUserId} from "~/session.server";

import {Input, Select} from "../../components";

const ACCOUNT_TYPES = {
  CREDIT_CARD: "creditCard",
  BANK_ACCOUNT: "bankAccount",
};

const INPUT_FIELDS = {
  INPUT: "INPUT",
  SELECT: "SELECT",
};

//TODO Generate account type dynamically on server start #30
const TYPE_OPTIONS: any[] = [
  {value: "max", display: "Max", type: ACCOUNT_TYPES.CREDIT_CARD},
  {value: "poalin", display: "Poalim", type: ACCOUNT_TYPES.BANK_ACCOUNT},
  {value: "isracard", display: "Isracard", type: ACCOUNT_TYPES.CREDIT_CARD},
];

const FORM_FIELDS = [
  {
    field: INPUT_FIELDS.INPUT,
    actionDataField: "budgetId",
    label: "Budget ID:",
  },
  {
    field: INPUT_FIELDS.INPUT,
    actionDataField: "accountId",
    label: "Account ID:",
  },
  {
    field: INPUT_FIELDS.SELECT,
    actionDataField: "type",
    label: "Type:",
    options: TYPE_OPTIONS,
  },
  {field: INPUT_FIELDS.INPUT, actionDataField: "name", label: "Name:"},
  {
    field: INPUT_FIELDS.INPUT,
    actionDataField: "username",
    label: "Username:",
  },
  {
    field: INPUT_FIELDS.INPUT,
    fieldType: "password",
    actionDataField: "password",
    label: "Password:",
  },
  {
    field: INPUT_FIELDS.INPUT,
    fieldType: "number",
    actionDataField: "sixLastDigits",
    label: "6 last digits:",
  },
];

function validateForm(formData) {
  for (const index in FORM_FIELDS) {
    const field = FORM_FIELDS[index]
    const value = formData.get(field.actionDataField)
    if (typeof value !== "string" || value.length === 0) {
        return json(
          { errors: { title: `${field.label} is required`, body: null } },
          { status: 400 }
        );
      }
    }
  }

  export async function action({request}: ActionArgs) {
    const userId = await requireUserId(request);

    const formData = await request.formData();
    const invalidInput = validateForm(formData)
    if (invalidInput) {
      return invalidInput
    }


    // const account = await createNote({ title, body, userId });

    // return redirect(`/accounts/${account.id}`);
  }

  export default function NewNotePage() {
    const actionData = useActionData<typeof action>();

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
          {FORM_FIELDS.map((field) => {
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
