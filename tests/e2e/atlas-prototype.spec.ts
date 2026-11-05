import { expect, test, type Page } from '@playwright/test';

async function dragHeader(page: Page, delta: number, steps = 12) {
  const box = (await page.getByTestId('sheet-gesture-zone').boundingBox())!;
  const x = box.x + 25;
  const y = box.y + 16;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, Math.max(3, y + delta), { steps });
  await page.mouse.up();
}

for (const viewport of [{width:390,height:844}, {width:430,height:932}]) {
  test(`two endpoints, scroll isolation and rapid gestures at ${viewport.width}`, async ({page}, info) => {
    test.skip(info.project.name !== 'mobile-chromium', 'Mobile sheet behavior');
    await page.setViewportSize(viewport);
    await page.goto('/atlas-v2/prototype');
    const sheet = page.getByTestId('race-sheet');
    const content = page.locator('[data-sheet-scroll]');
    const handle = page.getByRole('button', {name:'拖动或切换比赛周面板'});
    await expect(sheet).toHaveAttribute('data-stop', 'collapsed');
    await expect(content).toHaveAttribute('inert', '');
    await expect.poll(() => page.evaluate(() => document.body.style.position)).toBe('fixed');
    // A small move held before release must not be treated as a fling.
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x+20,box.y+16);
    await page.mouse.down();
    await page.mouse.move(box.x+20,box.y+7,{steps:4});
    await page.waitForTimeout(100);
    await page.mouse.up();
    await expect(sheet).toHaveAttribute('data-stop', 'collapsed');
    for (let i=0;i<3;i++) {
      await dragHeader(page, -viewport.height * 0.65);
      await expect(sheet).toHaveAttribute('data-stop','expanded');
      await dragHeader(page, viewport.height * 0.65);
      await expect(sheet).toHaveAttribute('data-stop','collapsed');
    }
    await handle.click();
    await expect(sheet).toHaveAttribute('data-stop','expanded');
    await expect.poll(async () => (await sheet.boundingBox())!.y).toBeLessThanOrEqual(1);
    // Content scroll remains independent and never changes the sheet state.
    await content.hover();
    await page.mouse.wheel(0,500);
    await expect.poll(() => content.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
    await expect(sheet).toHaveAttribute('data-stop','expanded');
    await page.mouse.wheel(0,-2000);
    await expect.poll(() => content.evaluate(node=>node.scrollTop)).toBe(0);
    await expect(sheet).toHaveAttribute('data-stop','expanded');
    // At the top, collapse uses the explicit header region, not content-scroll inference.
    await dragHeader(page, viewport.height * 0.6);
    await expect(sheet).toHaveAttribute('data-stop','collapsed');
    await page.getByRole('button',{name:'欧洲赛季'}).click();
    await handle.press('ArrowUp');
    await expect(sheet).toHaveAttribute('data-stop','expanded');
    await page.getByLabel('选择赛事',{exact:true}).selectOption('japan');
    await expect(page.getByRole('heading',{name:'SUZUKA',exact:true})).toBeVisible();
    await expect(sheet).toHaveAttribute('data-stop','expanded');
    const geometry = await page.evaluate(()=>({x:scrollX,y:scrollY,root:document.querySelector('main')!.scrollTop,body:document.body.scrollTop}));
    expect(geometry).toEqual({x:0,y:0,root:0,body:0});
    await page.setViewportSize({width:viewport.height,height:viewport.width});
    await expect(sheet).toHaveAttribute('data-stop','expanded');
    await handle.press('ArrowDown');
    await page.getByRole('link',{name:'返回 Atlas ↗'}).click();
    await expect(page).toHaveURL(/\/atlas-v2$/);
    await expect.poll(()=>page.evaluate(()=>document.body.style.position)).not.toBe('fixed');
    await expect.poll(()=>page.evaluate(()=>document.documentElement.style.overscrollBehavior)).not.toBe('none');
  });
}

test('selection and sheet endpoint changes retain the real Canvas', async ({page},info) => {
  test.skip(info.project.name === 'mobile-chromium', 'Existing fallback project disables WebGL');
  await page.goto('/atlas-v2/prototype?measure=1');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-atlas-first-frame-at', /\d/, {timeout:30_000});
  const identity = await canvas.elementHandle();
  const mountedAt = await canvas.getAttribute('data-atlas-mounted-at');
  await page.setViewportSize({width:390,height:844});
  const handle = page.getByRole('button',{name:'拖动或切换比赛周面板'});
  for (let i=0;i<3;i++) {
    await handle.press('ArrowUp');
    await expect(page.getByTestId('race-sheet')).toHaveAttribute('data-stop','expanded');
    await handle.press('ArrowDown');
    await expect(page.getByTestId('race-sheet')).toHaveAttribute('data-stop','collapsed');
  }
  await handle.press('ArrowUp');
  await page.getByLabel('选择赛事',{exact:true}).selectOption('japan');
  expect(await canvas.evaluate((node,previous)=>node === previous, identity)).toBe(true);
  await expect(canvas).toHaveAttribute('data-atlas-mounted-at', mountedAt!);
  await expect(canvas).not.toHaveAttribute('data-atlas-disposed-at', /\d/);
});
