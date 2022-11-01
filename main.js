const fs = require('fs');
const {exec} = require("child_process");

const rawdata = JSON.parse(fs.readFileSync('config.json'));
const ACCOUNT_TYPE_TO_SPEC_FILE = {
    poalim: "poalim.spec.ts"
}

function logProcess(error, stdout, stderr) {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
}

rawdata.accounts.forEach(account => {
    if (account.type in ACCOUNT_TYPE_TO_SPEC_FILE) {
        const process = exec(`PASSWORD=${account.password} USERNAME=${account.username} npx playwright test ${ACCOUNT_TYPE_TO_SPEC_FILE[account.type]}`, logProcess)
        process.on('exit', () => exec('python main.py', logProcess))
    }
})


