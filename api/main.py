from functools import wraps

import uvicorn
import firebase_admin
import pyrebase
import json

from fastapi import FastAPI, Request, Form, File, UploadFile, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from firebase_admin import credentials, auth

from common.utils import ynab_api
from enums import AccountTypeToProcessor

if not firebase_admin._apps:
    cred = credentials.Certificate('ynab-connector-38815-firebase-adminsdk-vcisv-9683889bdd.json')
    default_app = firebase_admin.initialize_app(cred)

pb = pyrebase.initialize_app(json.load(open('firebase_config.json')))
app = FastAPI()
allow_all = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_all,
    allow_credentials=True,
    allow_methods=allow_all,
    allow_headers=allow_all
)


def authenticated(Authorization: str = Header()):
    try:
        token = Authorization.replace('Bearer ', '')
        user = auth.verify_id_token(token)
        return user
    except:
        raise HTTPException(detail={'message': 'Invalid credentials'}, status_code=400)


# signup endpoint
@app.post("/signup", include_in_schema=False)
async def signup(request: Request):
    req = await request.json()
    email = req['email']
    password = req['password']
    if email is None or password is None:
        return HTTPException(detail={'message': 'Error! Missing Email or Password'}, status_code=400)
    try:
        user = auth.create_user(
            email=email,
            password=password
        )
        return JSONResponse(content={'message': f'Successfully created user {user.uid}'}, status_code=200)
    except Exception as e:
        return HTTPException(detail={'message': 'Error Creating User'}, status_code=400)


# login endpoint
@app.post("/login", include_in_schema=False)
async def login(request: Request):
    req_json = await request.json()
    email = req_json['email']
    password = req_json['password']
    try:
        user = pb.auth().sign_in_with_email_and_password(email, password)
        jwt = user['idToken']
        return JSONResponse(content={'token': jwt}, status_code=200)
    except:
        return HTTPException(detail={'message': 'There was an error logging in'}, status_code=400)


@app.post("/transactions-file", dependencies=[Depends(authenticated)])
async def send_transactions(budgetId: str = Form(), accountId: str = Form(),
                            accountType: str = Form(), transactionsFile: UploadFile = File(), ynabToken: str = Form()):
    processor = AccountTypeToProcessor().get_processor_by_type(accountType)

    if not processor:
        return HTTPException(detail={'message': 'Account type isn\'t valid'}, status_code=400)

    file_processor = processor(file=transactionsFile, account_id=accountId)
    transactions = file_processor.get_transactions()
    response = ynab_api.create_transactions(ynabToken, budgetId, transactions)

    return JSONResponse(content={"imported": response["imported"], "duplicated": response["duplicated"]},
                        status_code=200)


if __name__ == "__main__":
    uvicorn.run("main:app")
