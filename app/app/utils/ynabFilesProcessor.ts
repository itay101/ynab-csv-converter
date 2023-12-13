// import * as json from "json";
// import {ynabApi} from "./common/utils";
// import {configApi} from "./common/utils";
// import {AccountTypeToProcessor} from "./enums";
//
// const configFilePath = "~/config.json";
import * as fs from "fs";

const validExtensions = [".csv", ".xls", ".xlsx"];

import {createReadStream} from "fs";
import {AccountTypeToProcessor} from "~/utils/filesProcessors/converter";

export function processFiles(files) {
    // const configFile = open(os.expanduser(configFilePath));
    // const configData = json.load(configFile);
    const accounts = [];
    let transactions: any[] = [];
    for (const file of files) {
        const filename = file.name
        transactions = [
            ...transactions,
            ...getTransactionsFromFile(accounts, file, filename),
        ];
    }
    // if (transactions.length) {
    //   const token = configData.token;
    //   const budgetId = configData.budgetId;
    //   console.log(ynabApi.createTransactions(token, budgetId, transactions));
    // }
}

function getTransactionsFromFile(accounts, f, filename) {
    for (const processor of new AccountTypeToProcessor().getProcessors()) {
        try {
            const identifier = processor.identifyAccount(f, accounts);
            if (identifier) {
                console.log(`found identifier ${identifier} for filename ${filename}`);
                const config = configApi.getAccountConfigByIdentifier(accounts, identifier);
                if (!config) {
                    continue;
                }
                try {
                    const fileProcessor = processor({
                        filePath: filename,
                        accountId: config.accountId,
                    });
                    return fileProcessor.getTransactions();
                } catch (e) {
                    if (e instanceof Error && e.name === "FileNotFoundError") {
                        console.log(`${e.message}: ${e.filename} `);
                    } else {
                        throw e;
                    }
                }
            }
        } catch (e) {
            continue;
        }
    }
    return [];
}
