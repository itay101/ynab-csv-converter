import * as fs from 'fs';
import { homedir } from 'os'
import {exec} from "child_process";

import {test} from "@playwright/test";
import papaparse from 'papaparse';

import {isracardFetcher} from "./isracardFetcher";
import {maxFetcher} from "./maxFetcher";
import {poalimFetcher} from "./poalimFetcher";

const config = JSON.parse(fs.readFileSync(homedir() + '/config.json').toString())

const {accounts} = config;

const poalimAccounts = accounts.filter(account => account["type"] === 'poalim' && !account["skip_automation"]);
const isracardAccounts = accounts.filter(account => account["type"] === 'isracard' && !account["skip_automation"]);
const maxAccounts = accounts.filter(account => account["type"] === 'max' && !account["skip_automation"]);

const balance = []
test.describe('Fetching CSV Files from ', () => {
    poalimAccounts.forEach(account => {
        test(
            `${account["type"]}: ${account["account_identifier"]}`,
            ({page}) => poalimFetcher({page, account, balance})
        )
    })
    isracardAccounts.forEach(account => {
        test(
            `${account["type"]}: ${account["account_identifier"]}`,
            ({page}) => isracardFetcher({page, account, balance})
        )
    })
    maxAccounts.forEach(account => {
        test(
            `${account["type"]}: ${account["account_identifier"]}`,
            ({page}) => maxFetcher({page, account, balance})
        )
    })

})

test.afterAll(async ({page}) => {
    const blob = papaparse.unparse(balance, {columns: ['account_identifier', 'balance']})
    console.log(blob);

    exec("python main.py")
});
