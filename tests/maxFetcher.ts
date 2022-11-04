import {expect} from '@playwright/test';

export async function maxFetcher({page, account}) {

  await page.goto('https://www.max.co.il/login?ReturnUrl=https:%2F%2Fwww.max.co.il%2Ftransaction-details%2Fpersonal');

  await page.locator('a[role="tab"]:has-text("כניסה עם סיסמה")').click();

  await page.getByPlaceholder('שם משתמש').fill(account.username);

  await page.getByPlaceholder('סיסמה').fill(account.password);

  await page.locator('button:has-text("לכניסה לאזור האישי")').click();
  await expect(page).toHaveURL('https://www.max.co.il/homepage/personal');

  await page.locator('app-my-cards').getByText(account.account_identifier, {exact: false}).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('ייצא לאקסל').click()
  ]);

  await download.saveAs(`${process.env.HOME}/Downloads/${account.export_file_path}`)
}