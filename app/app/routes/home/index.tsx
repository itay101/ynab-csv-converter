import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {
    ActionArgs,
    json,
    redirect,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler, unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData, UploadHandler
} from "@remix-run/node";
import {useRef, useState} from "react";

import type {ChangeEvent} from "react";
import type {LoaderArgs, V2_MetaFunction} from "@remix-run/node";

import {doc, getDoc} from "firebase/firestore";
import {db} from "../../../firebase.client";
import {isSessionValid} from "../../../fb.sessions.server";
import {sessionLogout} from "../../../fb.sessions.server";
import {refreshTokenIfNeeded} from "~/utils/autorizeYnab";
import {getAccounts, getBudgets} from "~/utils/ynabApi";
import {processFiles} from "~/utils/ynabFilesProcessor";
import {createReadStream} from "fs";
import {composeUploadHandlers, parseMultipartFormData} from "@remix-run/server-runtime/dist/formData";
import {createMemoryUploadHandler} from "@remix-run/server-runtime/dist/upload/memoryUploadHandler";

export const meta: V2_MetaFunction = () => {
    return [{title: "Home | YNAB Connector"}];
};


export async function loader({request}: LoaderArgs) {
    const AUTHORIZE_URL = `https://app.youneedabudget.com/oauth/authorize?client_id=${process.env.REACT_APP_YNAB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`
    const {decodedClaims, error} = await isSessionValid(request, "/login");

    let docRef = doc(db, "ynabTokenByUid", decodedClaims.user_id);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw redirect(AUTHORIZE_URL);
    }
    let {accessToken, refreshToken, expiresIn} = docSnap.data();
    let updatedToken;
    try {
        updatedToken = await refreshTokenIfNeeded(decodedClaims.user_id, refreshToken, expiresIn)
    } catch (e) {
        throw redirect(AUTHORIZE_URL);
    }

    try {
        const newAccessToken = updatedToken ? updatedToken : accessToken;

        let defaultBudget = await getBudgets(newAccessToken)
        const accounts = await getAccounts(newAccessToken, defaultBudget)
        return json({
            error,
            accounts
        });

    } catch (e) {
        // debugger
    }
}

export const action = async ({request}: ActionArgs) => {
    // alternate method using just memeoryUploadHandler
    const uploadHandler = createMemoryUploadHandler();
    const formData = await parseMultipartFormData(request, uploadHandler);
    const files = formData.getAll('files');
    const response = processFiles(files)

    return json({
    });
};
export default function Index() {
    const data = useLoaderData();
    const fetcher = useFetcher();
    const {accounts} = data;

    return (
        <div className="ui container centered" style={{paddingTop: 40}}>
            <Form method="post" encType="multipart/form-data">
                <input type="file" accept=".csv, .xls, .xlsx" name="files" multiple/>
                <button type="submit" className="btn btn-sm">
                    UPLOAD CSV
                </button>
            </Form>
        </div>
    );
}