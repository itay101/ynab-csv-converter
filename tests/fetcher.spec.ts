import * as fs from 'fs';
import {exec} from "child_process";

import {test} from "@playwright/test";

import {isracardFetcher} from "./isracardFetcher";
import {maxFetcher} from "./maxFetcher";
import {poalimFetcher} from "./poalimFetcher";

const config = JSON.parse(fs.readFileSync('config.json').toString())

const {accounts} = config;

const poalimAccounts = accounts.filter(account => account["type"] === 'poalim');
const isracardAccounts = accounts.filter(account => account["type"] === 'isracard');
const maxAccounts = accounts.filter(account => account["type"] === 'max');

test.describe('Fetching CSV Files from ', () => {
    poalimAccounts.forEach(account => {
        test(`${account["type"]}: ${account["account_identifier"]}`, ({page}) => poalimFetcher({page, account}))
    })
    isracardAccounts.forEach(account => {
        test(`${account["type"]}: ${account["account_identifier"]}`, ({page}) => isracardFetcher({page, account}))
    })
    maxAccounts.forEach(account => {
        test(`${account["type"]}: ${account["account_identifier"]}`, ({page}) => maxFetcher({page, account}))
    })

    test.afterAll(async ({page}) => {
        // exec("python main.py")
    });
})
