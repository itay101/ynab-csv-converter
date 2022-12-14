import {expect} from '@playwright/test';

export async function poalimFetcher({page, account, balance}) {
  await page.goto('https://login.bankhapoalim.co.il/');
  await page.goto('https://login.bankhapoalim.co.il/ng-portals/auth/he/');


  await page.getByLabel('קוד משתמש').fill(account.username);
  await page.getByLabel('סיסמה').fill(account.password);

  await page.getByRole('button', {name: 'כניסה'}).click();
  await expect(page).toHaveURL('https://login.bankhapoalim.co.il/ng-portals/rb/he/homepage');
  await page.goto('https://login.bankhapoalim.co.il/ng-portals/rb/he/current-account/transactions');
  await page.getByRole('button', {name: 'ייצוא קבצים'}).click();

  const accountBalance = await page.locator('poalim-balance-and-limits > section > ul > li:nth-child(1) > div > span.currentBalance.d-inline-flex.number-positive').innerText()
  balance.push({account_identifier: account['account_identifier'], balance: accountBalance})

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', {name: 'לחץ כאן לייצא קובץ csv'}).click()
  ]);

  await download.saveAs(`${process.env.HOME}/Downloads/${account.export_file_path}`)

}
