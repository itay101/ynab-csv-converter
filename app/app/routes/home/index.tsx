import {useLoaderData, Form, useFetcher} from "@remix-run/react";
import {json, LoaderArgs, redirect, V2_MetaFunction} from "@remix-run/node";
import {doc, getDoc} from "firebase/firestore";

import {auth, db} from "../../../firebase.client";
import {isSessionValid} from "../../../fb.sessions.server";
import {sessionLogout} from "../../../fb.sessions.server";
import {refresh} from "~/utils/autorizeYnab";
import {getAccounts, getBudgets, getDefaultBudget} from "~/utils/ynabApi";
import {ChangeEvent, useState} from "react";

export const meta: V2_MetaFunction = () => {
    return [{title: "Home | YNAB Connector"}];
};

const AUTHORIZE_URL = `https://app.youneedabudget.com/oauth/authorize?client_id=${process.env.REACT_APP_YNAB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=code`

export async function loader({request}: LoaderArgs) {
    const {decodedClaims, error} = await isSessionValid(request, "/login");

    let docRef = doc(db, "ynabTokenByUid", decodedClaims.user_id);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw redirect(AUTHORIZE_URL);
    }
    let {accessToken, refreshToken} = docSnap.data();

    try {

        let defaultBudget = await getDefaultBudget(accessToken)

        if (defaultBudget.error?.id === '401') {
            await refresh(decodedClaims.user_id, refreshToken)
            docRef = doc(db, "ynabTokenByUid", decodedClaims.user_id);
            docSnap = await getDoc(docRef);
            const data = docSnap.data()
            defaultBudget = await getDefaultBudget(data?.accessToken)
        }

        const accounts = await getAccounts(accessToken, defaultBudget)
        return json({
            error,
            accounts
        });

    } catch (e) {
        debugger
    }
}

export async function action({request}) {
    return await sessionLogout(request);
}


export default function Index() {
    const data = useLoaderData();
    const {accounts} = data;
    const [files, setFiles] = useState<File[]>([])
    const [file, setFile] = useState<File | null>(null)

    const addFile = () => {
        setFiles([...files, file]);
        setFile(null)
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    return (
        <div className="ui container centered" style={{paddingTop: 40}}>
            <ul>
                {files.map(file => <p>{file.name}</p>)}
            </ul>
            <input type="file" onChange={handleFileChange}/>
            <button onClick={addFile}>+ Add File</button>
        </div>
    );
}