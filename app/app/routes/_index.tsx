import type {LoaderArgs, V2_MetaFunction} from "@remix-run/node";
import {Link, useLoaderData} from "@remix-run/react";
import {isSessionValid} from "../../fb.sessions.server";
import {json} from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
    return [{title: "YNAB Connector"}];
};

export async function loader({request}: LoaderArgs) {
    const {decodedClaims, error} = await isSessionValid(request, "home/");

    return json({})

}

export default function Index() {
    const data = useLoaderData();

    return (
        <div style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.4"}}>
            <h1>Welcome to YNAB Connector</h1>
            <ul>
                <li>
                    <Link to="/login">login</Link>
                    <Link to="/signup">signup</Link>
                </li>
            </ul>
        </div>
    );
}
