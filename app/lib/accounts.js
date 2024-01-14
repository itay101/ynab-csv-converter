import fs from 'fs';
import os from 'os';
import path from 'path';

const FILE_PATH = "config.json";

export function getAccounts() {
    return getLocalConfigFile().accounts
}
export function getAccountLocalConfigById(id) {
    const accounts = getAccounts();
    return accounts.find(account => account.account_id === id)

}

export function getLocalConfigFile() {
    const filePath = path.join(os.homedir(), FILE_PATH);
    return readLocalJsonFile(filePath)
}

export function getConfigByIdentifier(identifier) {
    const accounts = getAccounts();
    return accounts.find(account => account.account_identifier === identifier)
}

function readLocalJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
