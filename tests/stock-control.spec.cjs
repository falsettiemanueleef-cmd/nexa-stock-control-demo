const { test, expect } = require('@playwright/test');

test('product lifecycle, movement search, stock and reports', async ({ page }) => {
  const checkpoint = (name) => console.log('[E2E CHECKPOINT]', name);
  await page.goto('/');
  checkpoint('01 app loaded');
  await page.locator('button[data-view="inventory"]').click();
  await page.getByRole('button', { name: 'Nuovo prodotto' }).click();
  checkpoint('02 new product modal opened');
  await page.locator('#pname').fill('Prodotto QA');
  await page.locator('#pcode').fill('QA-001');
  await page.locator('#pcategory').selectOption({ label: 'Hardware' });
  await page.locator('#psubcategory').selectOption({ label: 'Accessori' });
  await page.locator('#pprice').fill('9.90');
  await page.locator('#pstock').fill('10');
  await page.locator('#pmin').fill('3');
  await page.getByRole('button', { name: 'Conferma' }).click();
  checkpoint('03 product created');
  let row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('Prodotto QA');
  await expect(row).toContainText('Accessori');
  await expect(row).toContainText('10');

  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  checkpoint('04 movement modal opened');
  await page.locator('#mcategory').selectOption({ label: 'Hardware' });
  await page.locator('#msubcategory').selectOption({ label: 'Accessori' });
  await page.locator('#msearch').fill('QA-001');
  await expect(page.locator('#mproduct option')).toHaveCount(1);
  await page.locator('#mtype').selectOption('Vendita');
  await page.locator('#mqty').fill('2');
  await page.getByRole('button', { name: 'Conferma' }).click();
  checkpoint('05 sale recorded');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('8');
  await page.getByRole('button', { name: 'Inventario' }).click();

  await row.locator('[data-edit-product]').click();
  checkpoint('06 edit modal opened');
  await page.locator('#pname').fill('Prodotto QA aggiornato');
  await page.locator('#pprice').fill('10.50');
  await page.getByRole('button', { name: 'Conferma' }).click();
  checkpoint('07 product edited');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('Prodotto QA aggiornato');
  await expect(row).toContainText('10,50');

  page.once('dialog', dialog => dialog.accept());
  await row.locator('[data-archive-product]').click();
  checkpoint('08 product archived');
  await page.locator('#archiveFilter').selectOption('archived');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).toContainText('Archiviato');
  await row.locator('[data-restore-product]').click();
  checkpoint('09 product restored');
  await page.locator('#archiveFilter').selectOption('active');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  await expect(row).not.toContainText('Archiviato');

  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#msearch').fill('QA-001');
  await expect(page.locator('#mproduct option')).toHaveCount(1);
  await page.getByRole('button', { name: 'Annulla' }).click();
  checkpoint('10 movement search rechecked');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Esporta dati' }).click()
  ]);
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();
  checkpoint('11 backup exported');
  await page.getByRole('button', { name: 'Inventario' }).click();
  await page.locator('#search').fill('QA-001');
  row = page.locator('#inventoryRows tr').filter({ hasText: 'QA-001' });
  page.on('dialog', dialog => dialog.accept());
  await row.locator('[data-hard-delete-product]').click();
  await expect(page.locator('#inventoryRows')).not.toContainText('QA-001');
  checkpoint('12 hard delete completed');

  await page.locator('#importFile').setInputFiles(backupPath);
  await expect(page.locator('#inventoryRows')).toContainText('QA-001');
  checkpoint('13 backup restored');
  await page.getByRole('button', { name: 'Movimenti' }).click();
  await expect(page.locator('#moveRows')).toContainText('Prodotto QA aggiornato');
  await expect(page.locator('#moveRows')).toContainText('Vendita');
  checkpoint('14 history and reports verified');
});

test('blocks sales above available stock and keeps app shell cacheable', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBeTruthy();
  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#msearch').fill('BAS-014');
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


test('delete movement reduces stock and optional sales cleanup removes demo revenue', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#msearch').fill('BAS-014');
  await page.locator('#mtype').selectOption('Elimina');
  await expect(page.locator('#eraseSalesWrap')).not.toHaveClass(/hidden/);
  await page.locator('#mqty').fill('2');
  await page.getByRole('button', { name: 'Conferma' }).click();
  await expect(page.locator('#modalBack')).not.toHaveClass(/open/);
  await page.getByRole('button', { name: 'Inventario' }).click();
  let row = page.locator('#inventoryRows tr').filter({ hasText: 'BAS-014' });
  await expect(row).toContainText('6');
  await page.getByRole('button', { name: 'Movimenti' }).click();
  await expect(page.locator('#moveRows')).toContainText('Elimina');

  await page.getByRole('button', { name: 'Registra movimento' }).first().click();
  await page.locator('#msearch').fill('BAS-014');
  await page.locator('#mtype').selectOption('Elimina');
  await page.locator('#eraseSales').check();
  await page.locator('#mqty').fill('1');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Conferma' }).click();
  await expect(page.locator('#modalBack')).not.toHaveClass(/open/);
  await page.getByRole('button', { name: 'Movimenti' }).click();
  const productRows = page.locator('#moveRows tr').filter({ hasText: 'Base neutra 50/50' });
  await expect(productRows.filter({ hasText: 'Vendita' })).toHaveCount(0);
  await expect(productRows.filter({ hasText: 'Elimina' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Report vendite' }).click();
  await expect(page.locator('#reportRanking')).not.toContainText('Base neutra 50/50');
});
