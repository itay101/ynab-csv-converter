import {doc, getDoc, setDoc} from "firebase/firestore";
import {db} from "../../firebase.client";
import {redirect} from "@remix-run/node";

export function authorize(user_id, authorizationCode) {
    token(user_id, {code: authorizationCode})
}

export async function refresh(user_id, refreshCode) {
    const data = {
        refresh_token: refreshCode,
        grant_type: 'refresh_token',
        client_id: process.env.REACT_APP_YNAB_CLIENT_ID,
        client_secret: process.env.REACT_APP_YNAB_CLIENT_SECRET,
        redirect_uri: process.env.REACT_APP_REDIRECT_URI
    };
    const res = await fetch('https://api.youneedabudget.com/oauth/token', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const resData = await res.json();

    await setDoc(doc(db, "ynabTokenByUid", user_id), {
        accessToken: resData.access_token,
        refreshToken: resData.refresh_token,
        expiresIn: resData.expires_in * 1000 + resData.created_at * 1000
    });
}

async function token(user_id, params) {
    const data = {
        ...params,
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_YNAB_CLIENT_ID,
        client_secret: process.env.REACT_APP_YNAB_CLIENT_SECRET,
        redirect_uri: process.env.REACT_APP_REDIRECT_URI
    };

    const res = await fetch('https://api.ynab.com/oauth/token', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const resData = await res.json();

    await setDoc(doc(db, "ynabTokenByUid", user_id), {
        accessToken: resData.access_token,
        refreshToken: resData.refresh_token,
        expiresIn: resData.expires_in * 1000 + resData.created_at * 1000
    });

    return resData.access_token
}

export async function refreshTokenIfNeeded(user_id, refreshToken, expiresIn) {
    if (new Date(expiresIn) < new Date()) {
        return await refresh(user_id, refreshToken);
    }
}