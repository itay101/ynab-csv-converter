// app/sessions.js
import {redirect, createCookieSessionStorage} from "@remix-run/node"; // or "@remix-run/cloudflare"

// Initialize Firebase
// ---------------------
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            apiKey: "AIzaSyDwkB1u_fH6zrfqOzk0GqZXBIb2mUWXOoY",
            authDomain: "ynab-connector-38815.firebaseapp.com",
            projectId: "ynab-connector-38815",
            private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKwYtHTZ8qraEa\nZbaWQ5EsTBoMjZDtF6555yrfJuYwwBAMoHVOqIZY0LUOK9ACgVGWHtd/WagovGDH\n8VS0GeJlPGq7nVJVJl862CN9Mhh9Ehrf1LNOo7ntcMQw5Ck9cY9gptkGKnz3hqs8\nFz4bvahvndx/ub1lipZg6BzPUY/kFxY+ihN7aYwjKC1Jsm3oxPjulUxAGxwNbKBL\n8mbYiKyYLNCnZPvAnJ1qsltbBxMjQyka8tuoQDSv5/8+ZvUIWkrekAslfIXTiOg6\nXpC2w3wj0mN5xXB4u6FGB2cJsfPcdNooW0cxV05qKjvruxQXCcqEwA5XX76yK4x4\njuBtz3lxAgMBAAECggEAEAhmjJCRQpn9o5PU1wrOiuIVRaMK79lpcd9ICK+C3VEB\nE+NUucMVJVnF/DH8hIfLg7Ag2nbXysM9CrwR6ba9EpDiYCXF3tDZdlKk2V+h1LLS\nG2f7Q8xdK+7r79fJTdme4x9eb7pIk0Qu+/uOIDoKyZGCLNSed7SSEcvY8PXiOto9\nq7xQpvSwoSd3S02KmN6l9WKFIgH+uEGrcjXxRp9HiEMg5DXJGtRut/OgZT3GDQ0k\ndYnOKyP5llO3uKBR9y6brQYXHanJKwP0LWxfJ4H/7jQwIIIBgUpXAXFNbrn8x0rp\nJC91nTjaOLxQfrOezGyqY/5LYIuTETvHgDj9EOGQtwKBgQDmArvDJPEdFLcewJ6w\n1vetK/Mep9aWzLFct9GXZWi+Hay9wkwjS+O1w147kFdkfYKwXYBiGtmht6l7ua9h\n2Kul9uPWCgTRoiSrfKYi6q2/QuCysyjLG8cqnKhRmZ2ZLN2mzwLS06S4YpXOUm6V\n7RyL9JaFiC8/Q4R6xq5jiX/25wKBgQDhqnIDNnKvO7nQZenHc+BVN/J12WYUrhil\nxlZ5GiZNI7zrtbRySdFGo3429NwRSTaS9Pz1mwcW7c5TkJIe//laKvNjqwaULWx6\nNFCeQOztbsW9IXW2yo3Y6/7OdcOrtgNVSAQvWgiqnBsRe98BS8HDQW5Vb/w88N7s\nOwiUoSf55wKBgQCXDfSBlCFFF/WrHJUbThIaiGKCH3euUX+phI8A/nhrYtGvTYrz\nI0PIeyXHuGOse0D40m8d/sQukI+d0bR8be9Mb3fxeWLwyauLc7En/TdeBG3M7hw8\nR2HlejyQWnJFxlFK22jfTF9BOH1ponk9vRqiT18LEwT0Z0L53sFoXUTMwQKBgQCK\n4UfrfD3WZE5119KpQkIkkBrytkmhnodito6PVy2NOdpRwfD8iTt3WrUZg1ZQeRtS\nE93+FVumm9HoEcgrteMyv84sX5vb45yoFLwsuM5XTV36iLYWOdBUWODnFQjIC2s/\nt+ODdMhyn0H1X6Od+46S6RjLEfFNW/wFrEsalZexrwKBgHDgnkVVGGAaE+1m6Yxx\n4vZBZi1RfQVB61MJ0aLAGoSqqevUAmS0LeTeOnORo/30qSQYxk8xiJ03osfYIFzs\nSKIQxYToZ27hu7t/9RX7cGtNYo+srvtMTK4//dakPNWPyhyLu9bJ9i8Y//h7lpsL\nFCH0zhWWhZQqa/faGwlXwd9R\n-----END PRIVATE KEY-----\n",
            client_email: "firebase-adminsdk-vcisv@ynab-connector-38815.iam.gserviceaccount.com",
            storageBucket: "ynab-connector-38815.appspot.com",
            messagingSenderId: "114513090606",
            appId: "1:114513090606:web:a2bd32e196a6997c44e7bf",
            measurementId: "G-7S9YPSWK26"
        }),
    });
}

/**
 * setup the session cookie to be used for firebase
 */
const {getSession, commitSession, destroySession} =
    createCookieSessionStorage({
        cookie: {
            name: "fb:token",
            expires: new Date(Date.now() + 600),
            httpOnly: true,
            maxAge: 600,
            path: "/",
            sameSite: "lax",
            secrets: ["f3cr@z7"],
            secure: true,
        },
    });

/**
 * checks that the current session is a valid session be getting the token
 * from the session cookie and validating it with firebase
 *
 * @param {*} param0
 * @returns
 */
export const isSessionValid = async (request, redirectTo) => {
    const session = await getSession(request.headers.get("cookie"));
    try {
        // Verify the session cookie. In this case an additional check is added to detect
        // if the user's Firebase session was revoked, user deleted/disabled, etc.
        const decodedClaims = await admin
            .auth()
            .verifySessionCookie(session.get("idToken"), true /** checkRevoked */);
        return {success: true, decodedClaims};
    } catch (error) {
        // Session cookie is unavailable or invalid. Force user to login.
        // return { error: error?.message };
        throw redirect(redirectTo, {
            statusText: error?.message,
        });
    }
};

/**
 * set the cookie on the header and redirect to the specified route
 *
 * @param {*} sessionCookie
 * @param {*} redirectTo
 * @returns
 */
const setCookieAndRedirect = async (
    request,
    sessionCookie,
    redirectTo = "/"
) => {
    const session = await getSession(request.headers.get("cookie"));
    session.set("idToken", sessionCookie);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
};

/**
 * login the session by verifying the token, if all is good create/set cookie
 * and redirect to the appropriate route
 *
 * @param {*} idToken
 * @param {*} redirectTo
 * @returns
 */
export const sessionLogin = async (request, idToken, redirectTo) => {

    const token = await admin.auth().verifyIdToken(idToken);
    console.log("idtoken verified", idToken)

    return admin
        .auth()
        .createSessionCookie(idToken, {
            expiresIn: 60 * 60 * 24 * 5 * 1000,
        })
        .then(
            (sessionCookie) => {
                // Set cookie policy for session cookie.
                return setCookieAndRedirect(request, sessionCookie, redirectTo);
            },
            (error) => {
                return {
                    error: `sessionLogin error!: ${error.message}`,
                };
            }
        );
};

/**
 * revokes the session cookie from the firebase admin instance
 * @param {*} request
 * @returns
 */
export const sessionLogout = async (request) => {
    const session = await getSession(request.headers.get("cookie"));

    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    return admin
        .auth()
        .verifySessionCookie(session.get("idToken"), true /** checkRevoked */)
        .then((decodedClaims) => {
            return admin.auth().revokeRefreshTokens(decodedClaims?.sub);
        })
        .then(async () => {
            return redirect("/login", {
                headers: {
                    "Set-Cookie": await destroySession(session),
                },
            });
        })
        .catch((error) => {
            console.log(error);
            // Session cookie is unavailable or invalid. Force user to login.
            return {error: error?.message};
        });
};