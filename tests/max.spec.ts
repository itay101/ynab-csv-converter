import { test, expect } from '@playwright/test';

test('Fetch max CSV file', async ({ page }) => {

  await page.goto('https://www.max.co.il/login');

  await page.locator('a[role="tab"]:has-text("כניסה עם סיסמה")').click();

  await page.getByPlaceholder('שם משתמש').fill(process.env.USERNAME);

  await page.getByPlaceholder('סיסמה').fill(process.env.PASSWORD);

  await page.locator('button:has-text("לכניסה לאזור האישי")').click();
  await expect(page).toHaveURL('https://www.max.co.il/homepage/personal');

  await page.locator('app-my-cards').getByText(process.env.IDENTIFIER, {exact: false}).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByText('ייצא לאקסל').click()
  ]);

  await download.saveAs(`${process.env.HOME}/Downloads/${process.env.IDENTIFIER}.xlsx`)
});