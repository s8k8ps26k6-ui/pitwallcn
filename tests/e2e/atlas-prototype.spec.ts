import { expect, test } from '@playwright/test';

test('prototype keeps the sheet functional when WebGL is unavailable', async ({ page }, info) => {
  await page.goto('/atlas-v2/prototype');
  const sheet = page.getByTestId('race-sheet');
  await expect(sheet).toBeVisible();
  if (info.project.name === 'mobile-chromium') {
    await expect(page.getByText('地球渲染不可用', {exact:false})).toBeVisible();
    await page.getByRole('button', {name:'展开面板', exact:true}).click();
    await expect(sheet).toHaveAttribute('data-stop', 'partial');
    const handle = page.getByRole('button', {name:'拖动或切换比赛周面板'});
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y - 140, {steps:10});
    await page.mouse.up();
    await expect(sheet).toHaveAttribute('data-stop', 'full');
    await handle.press('ArrowDown');
    await expect(sheet).toHaveAttribute('data-stop', 'partial');
  }
  await page.getByLabel('选择赛事', {exact:true}).selectOption('japan');
  await expect(page.getByRole('heading', {name:'SUZUKA',exact:true})).toBeVisible();
  await expect(page.getByRole('button', {name:'欧洲赛季'})).toBeEnabled();
  const geometry = await page.evaluate(() => ({width:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth, y:window.scrollY}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);
  expect(geometry.y).toBe(0);
});

test('sheet and selection preserve the live Canvas when WebGL works', async ({page},info) => {
  test.skip(info.project.name === 'mobile-chromium', 'Existing mobile project deliberately disables WebGL');
  await page.goto('/atlas-v2/prototype?measure=1');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-atlas-first-frame-at', /\d/, {timeout:30_000});
  const mountedAt = await canvas.getAttribute('data-atlas-mounted-at');
  await page.getByLabel('选择赛事', {exact:true}).selectOption('japan');
  await page.getByRole('button', {name:'欧洲赛季'}).click();
  await expect(canvas).toHaveAttribute('data-atlas-mounted-at', mountedAt!);
  await expect(canvas).not.toHaveAttribute('data-atlas-disposed-at', /\d/);
});
