import {expect} from '@playwright/test';

export async function maxFetcher({page, account, balance}) {

  await page.goto('https://www.max.co.il/login?ReturnUrl=https:%2F%2Fwww.max.co.il%2Ftransaction-details%2Fpersonal');

  await page.locator('a[role="tab"]:has-text("כניסה עם סיסמה")').click();

  await page.getByPlaceholder('שם משתמש').fill(account.username);

  await page.getByPlaceholder('סיסמה').fill(account.password);

  await page.locator('button:has-text("לכניסה לאזור האישי")').click();
  await expect(page).toHaveURL('https://www.max.co.il/homepage/personal');

  await page.locator('app-my-cards').getByText(account.account_identifier, {exact: false}).click();

  const accountBalance = await page.locator('body > app-root > app-main-layout > section > section > app-transaction-details > div > div.deal-table > div > app-header > div.sum-wrapper.ng-star-inserted > div > div > span > app-sum > span > span').innerText()
  balance.push({account_identifier: account['account_identifier'], balance: accountBalance})

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('ייצא לאקסל').click()
  ]);

  await download.saveAs(`${process.env.HOME}/Downloads/${account.export_file_path}`)
}
