import {exec} from "child_process";

import {test} from "@playwright/test";

import {prisma} from "~/db.server";

import {isracardFetcher} from "./isracardFetcher";
import {maxFetcher} from "./maxFetcher";
import {poalimFetcher} from "./poalimFetcher";
import type {Account} from "@prisma/client";
import type {FetchConfig, FetchConfigAccount} from "../types/fetchTypes";
import {decrypt} from "../utils/encryptionUtils";

const groupAccountsByBudget = (accounts: Account[]) => {
    return accounts.reduce((group: any, account: Account) => {
        const {budgetId} = account;
        group[budgetId] = group[budgetId] ?? [];
        const {accountId, type, username, password} = account;
        // @ts-ignore
        group[budgetId].push({token: decrypt(JSON.parse(account.user.ynabToken)), account_id: accountId, type, username, password, skip_automation: false, file_path: "XXX", export_file_path: "XXX"});
        return group;
    }, {})
};

const generateConfigsByBudget = (groupedByBudget: any) => {
    const configs: FetchConfig[] = [];
    for (const budget in groupedByBudget) {
        const token = groupedByBudget[budget][0].token
        // @ts-ignore
        const budgetConfig: FetchConfig = {token: token, budget_id: budget, accounts: groupedByBudget[budget].map(({token, ...rest}) => rest)};
        configs.push(budgetConfig);
    }

    return configs;
};

const balance = []
let poalimAccounts: any[];
let isracardAccounts: any[];
let maxAccounts: any[];

test.beforeAll(async () => {
    const allAccounts = await prisma.account.findMany({
        include: {
            user: true
        }
    });
    const groupedByBudget = groupAccountsByBudget(allAccounts);
    const configs: FetchConfig[] = generateConfigsByBudget(groupedByBudget);

    const {accounts} = configs[0];

    const filteredAccounts = (accounts as FetchConfigAccount[]).filter(account => !account["skip_automation"]);
    poalimAccounts = filteredAccounts.filter(account => account["type"] === 'poalim');
    isracardAccounts = filteredAccounts?.filter(account => account["type"] === 'isracard');
    maxAccounts = filteredAccounts?.filter(account => account["type"] === 'max');
});

test.describe('Fetching CSV Files from ', () => {
    test("kuku", () => {
        console.log("test")
    })
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
    console.log(balance);
    exec("python main.py")
});
