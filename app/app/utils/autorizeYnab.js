import {doc, setDoc} from "firebase/firestore";
import {db} from "../../firebase.client";

export function authorize(user_id, authorizationCode) {
    token(user_id, {code: authorizationCode})
}

export function refresh(user_id, refreshCode) {
    token(user_id, {refresh_token: refreshCode})
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
        refreshToken: resData.refresh_token
    });
}