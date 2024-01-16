const fs = require('fs');
const {exec} = require("child_process");

const rawdata = JSON.parse(fs.readFileSync('config.json'));

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
    if (account.password && account.username) {
        const process = exec(`ACCOUNT=${JSON.stringify(account)} PASSWORD=${account.password} USERNAME=${account.username} IDENTIFIER=${account['account_identifier']} npx playwright test ${account.type}.spec.ts --headed`, logProcess)
        process.on('exit', () => exec('python main.py', logProcess))
    }
})


