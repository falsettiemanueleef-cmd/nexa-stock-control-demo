const { test, expect } = require('@playwright/test');

test('product lifecycle, movement search, stock and reports', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Inventario' }).click();
  await page.getByRole('button', { name: 'Nuovo prodotto' }).click();
  await page.locator('#pname').fill('Prodotto QA');
  await page.locator('#pcode').fill('QA-001');
  await page.locator('#pcategory').selectOption({ label: 'Hardware' });
  await page.locator('#psubcategory').selectOption({ label: 'Accessori' });
  await page.locator('#pprice').fill('9.90');
  await page.locator('#pstock').fill('10');
  await page.locator('#pmin').fill('3');
  await page.getByRole('button', { name: 'Conferma' }).click();
  let row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('Prodotto QA');
  await expect(row).toContainText('Accessori');
  await expect(row).toContainText('10');

  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#mcategory').selectOption({ label: 'Hardware' });
  await page.locator('#msubcategory').selectOption({ label: 'Accessori' });
  await page.locator('#msearch').fill('QA-001');
  await expect(page.locator('#mproduct option')).toHaveCount(1);
  await page.locator('#mtype').selectOption('Vendita');
  await page.locator('#mqty').fill('2');
  await page.getByRole('button', { name: 'Conferma' }).click();
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('8');
  await page.getByRole('button', { name: 'Inventario' }).click();

  await row.getByRole('button', { name: 'Modifica' }).click();
  await page.locator('#pname').fill('Prodotto QA aggiornato');
  await page.locator('#pprice').fill('10.50');
  await page.getByRole('button', { name: 'Conferma' }).click();
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('Prodotto QA aggiornato');
  await expect(row).toContainText('10,50');

  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: 'Archivia' }).click();
  await page.locator('#archiveFilter').selectOption('archived');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('Archiviato');
  await page.getByRole('button', { name: 'Ripristina' }).click();
  await page.locator('#archiveFilter').selectOption('active');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).not.toContainText('Archiviato');

  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#msearch').fill('QA-001');
  await expect(page.locator('#mproduct option')).toHaveCount(1);
  await page.getByRole('button', { name: 'Annulla' }).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Esporta dati' }).click()
  ]);
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();
  await page.locator('#search').fill('QA-001');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  page.once('dialog', dialog => dialog.accept());
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: 'Elimina e cancella dati' }).click();
  await expect(page.locator('#inventoryRows')).not.toContainText('QA-001');

  page.on('dialog', dialog => dialog.accept());
  await page.locator('#importFile').setInputFiles(backupPath);
  await expect(page.locator('#inventoryRows')).toContainText('QA-001');
  await page.getByRole('button', { name: 'Movimenti' }).click();
  await expect(page.locator('#moveRows')).toContainText('Prodotto QA aggiornato');
  await expect(page.locator('#moveRows')).toContainText('Vendita');
});

test('blocks sales above available stock and keeps app shell cacheable', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBeTruthy();
  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#msearch').fill('ACC-017');
  await page.locator('#mtype').selectOption('Vendita');
  await page.locator('#mqty').fill('999');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Conferma' }).click();
  await expect(page.locator('#modalBack')).toHaveClass(/open/);
  await page.getByRole('button', { name: 'Annulla' }).click();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toContainText('NEXA STOCK CONTROL');
  await context.setOffline(false);
});
