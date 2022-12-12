import * as React from "react";
import {ActionArgs, json, redirect} from "@remix-run/node";

import {Form, Link, useActionData} from "@remix-run/react";
import {useUser} from "~/utils";
import {requireUserId} from "~/session.server";
import {updateYNABTokenUserById} from "~/models/user.server";
import {encrypt} from "../../utils/encryptionUtils";

export async function action({request}: ActionArgs) {
    const userId = await requireUserId(request);

    const formData = await request.formData();
    const ynabToken = formData.get("ynabToken");

    if (typeof ynabToken !== "string" || ynabToken.length === 0) {
        return json(
            {errors: {title: "YNAB token is required", body: null}},
            {status: 400}
        );
    }

    await updateYNABTokenUserById({ynabToken: encrypt(ynabToken), userId});

    return redirect(`/accounts/`)
}

export default function newToken() {
    const actionData = useActionData<typeof action>();
    const user = useUser();

    return <div className="flex h-full min-h-screen flex-col">
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
            <div className="flex-1 p-6">
                <Form method="post"
                >
                    <label className="flex w-full flex-col gap-1">
                        <span>YNAB Token: </span>
                        <input
                            name="ynabToken"
                            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                            aria-invalid={actionData?.errors?.title ? true : undefined}
                            aria-errormessage={
                                actionData?.errors?.title ? "title-error" : undefined
                            }
                        />
                    </label>
                    <div className="text-right">
                        <button
                            type="submit"
                            className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                        >
                            Save
                        </button>
                    </div>
                </Form>
            </div>
        </main>
    </div>
}