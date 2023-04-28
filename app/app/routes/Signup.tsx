import {auth} from '../../firebase.client'
import {Form, Link} from "@remix-run/react";
import type {V2_MetaFunction, ActionArgs} from "@remix-run/node";
import {createUserWithEmailAndPassword, getAuth} from "@firebase/auth";
import { sessionLogin } from "../../fb.sessions.server";

export const meta: V2_MetaFunction = () => {
    return [{title: "Signup | YNAB Connector"}];
};

export async function action({request}: ActionArgs) {
    const body = await request.formData();
    const email = body.get('email');
    const password = body.get('password');

    await auth.signOut();
    try {
        //setup user data
        await createUserWithEmailAndPassword(auth, email, password);

        const idToken = await auth.currentUser.getIdToken();
        return await sessionLogin(request, idToken, "/");

    } catch (error) {
        return {error: {message: error?.message}};
    }
}

export default function Signup() {
    return <>
        <h1>Signup</h1>
        <Form method="post">
            <label> Email:<input type="email" name="email" required/></label>
            <label> Password:<input type="password" name="password" required/></label>
            <button type="submit">Signup!</button>
        </Form>
        <p><Link to="/login">login</Link>
        </p>
    </>
}