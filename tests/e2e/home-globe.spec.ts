import { expect,test } from '@playwright/test';

test('home-next current event is directly reachable and selection updates its data entry',async({page},info)=>{
  await page.clock.install({time:new Date('2026-11-07T12:00:00Z')});
  await page.goto('/home-next');
  const home=page.getByRole('main',{name:'LAPMETRY 全球赛事首页原型'});
  await expect(home).toHaveAttribute('data-home-ready','true');
  await expect(home).toHaveAttribute('data-selected-event','sao-paulo');
  await page.getByRole('button',{name:'站点索引',exact:true}).click();
  await page.getByLabel('导航选择赛事',{exact:true}).selectOption('japan');
  await expect(home).toHaveAttribute('data-selected-event','japan');
  if(info.project.name==='mobile-chromium') {
    await page.getByRole('button',{name:'展开面板',exact:true}).click();
    await expect(page.getByTestId('race-sheet')).toHaveAttribute('data-stop','expanded');
  }
  await expect(page.getByRole('link',{name:'打开赛事详情 ↗'})).toHaveAttribute('href','/races/2026/japan-gp-2026');
  if(info.project.name==='mobile-chromium') await page.getByRole('button',{name:'收起面板',exact:true}).click();
  await page.getByRole('button',{name:'当前比赛周',exact:true}).click();
  await expect(home).toHaveAttribute('data-selected-event','sao-paulo');
  if(info.project.name==='mobile-chromium') await expect(page.getByTestId('race-sheet')).toHaveAttribute('data-stop','expanded');
  expect(await page.evaluate(()=>scrollY)).toBe(0);
});

test('desktop panel can collapse without removing the globe stage or navigation',async({page},info)=>{
  test.skip(info.project.name!=='desktop-chromium','Desktop panel');
  await page.goto('/home-next');
  await page.getByRole('button',{name:'收起赛事面板 →'}).click();
  await expect(page.getByTestId('race-sheet')).not.toBeVisible();
  await expect(page.getByTestId('globe-stage')).toBeVisible();
  await page.getByRole('button',{name:'← 打开赛事面板'}).click();
  await expect(page.getByTestId('race-sheet')).toBeVisible();
  await page.getByRole('navigation',{name:'首页主导航'}).getByRole('link',{name:'赛历',exact:true}).click();
  await expect(page).toHaveURL(/\/schedule$/);
  await expect.poll(()=>page.evaluate(()=>document.body.style.position)).not.toBe('fixed');
});

test('real globe remains the same Canvas across mobile sheet and desktop panel states',async({page},info)=>{
  test.skip(info.project.name==='mobile-chromium','Fallback project deliberately disables WebGL');
  await page.goto('/home-next?measure=1');
  const canvas=page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-atlas-first-frame-at',/\d/,{timeout:30000});
  const identity=await canvas.elementHandle();
  await page.getByRole('button',{name:'收起赛事面板 →'}).click();
  await page.getByRole('button',{name:'← 打开赛事面板'}).click();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'当前比赛周'}).click();
  await expect(page.getByTestId('race-sheet')).toHaveAttribute('data-stop','expanded');
  await page.getByRole('button',{name:'收起面板',exact:true}).click();
  expect(await canvas.evaluate((node,previous)=>node===previous,identity)).toBe(true);
});
