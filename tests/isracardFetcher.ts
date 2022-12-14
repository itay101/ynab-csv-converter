import {expect} from '@playwright/test';

export async function isracardFetcher({page, account, balance}) {

    await page.goto('https://digital.isracard.co.il/personalarea/Login/?returnUrl=http://digital.isracard.co.il/personalarea/dashboard/');

    await page.getByText('או כניסה עם סיסמה קבועה').click();

    await page.locator('form[role="form"]:has-text("כניסה באמצעות תעודת זהות או דרכון תעודת זהות דרכון מספר תעודת זהות 6 ספרות אחרונ")').getByLabel('מספר תעודת זהות').fill(account.username);

    await page.locator('input[name="otpLoginLastDigits_ID"]').fill(account.card_last_digits);

    await page.getByLabel('סיסמה').fill(account.password);

    await page.getByLabel('סיסמה').press('Enter');
    await expect(page).toHaveURL('https://digital.isracard.co.il/personalarea/dashboard/');

    await page.locator('#collapse1').getByText('פירוט חיובים ועסקאות').click();
    await page.goto('https://digital.isracard.co.il/personalarea/transaction-list/');

    const accountBalance = await page.locator('#wholePageExport > div:nth-child(6) > div > div > div > div.nonprint-landscape-a4 > div.transaction-details__total-info > div.ng-scope > ul > li > span').innerText()
    balance.push({account_identifier: account['account_identifier'], balance: accountBalance})


    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('.export-list > ul > li:nth-child(1) > img').first().click()
    ]);

    await download.saveAs(`${process.env.HOME}/Downloads/${account.export_file_path}`)

}
