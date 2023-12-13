import {useLoaderData} from "@remix-run/react";
import {isSessionValid} from "../../fb.sessions.server";
import type {LoaderArgs} from "@remix-run/node";
import {authorize} from '~/utils/autorizeYnab';

import {json} from "@remix-run/node";

export async function loader({request}: LoaderArgs) {
    const {decodedClaims} = await isSessionValid(request, '/login');
    const authorizationCode = new URL(request.url).searchParams.get("code");

    try {
        authorize(decodedClaims.user_id, authorizationCode)
        return json({});
    } catch (e) {
        return e.message;
    }
}

export default function AuthorizeYnab() {
    useLoaderData()

    return <p>Authorizing....</p>
}