import { expect, test, type Locator, type Page } from '@playwright/test';

const targetViewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

const pageSections = [
  '#about',
  '#journey',
  '#works',
  '#visuals',
  '#links',
] as const;

const journeyStages = [
  {
    selector: '#journey-origin-2018',
    title: '被发现的声音',
    year: '2018',
  },
  {
    selector: '#journey-observation-2019',
    title: '从网络走向现场',
    year: '2019',
  },
  {
    selector: '#journey-magic-rebuilding-2020-2021',
    title: '在无法相聚时重构舞台',
    year: '2020–2021',
  },
  {
    selector: '#journey-expansion-2022-2023',
    title: '把虚拟歌声带进武道馆',
    year: '2022–2023',
  },
  {
    selector: '#journey-fable-2024',
    title: '进入创作的第二章',
    year: '2024',
  },
  {
    selector: '#journey-transcendent-love-2025-2026',
    title: '走向更大的世界',
    year: '2025–2026',
  },
] as const;

const galleryTitles = [
  '花譜ちゃん',
  '忘れてしまえ',
  '不可解',
  '糸',
  '過去を喰らう',
  '景色',
  'チューイン・ディスコ',
  'ユーフォーを見にいこう',
] as const;

async function openHome(
  page: Page,
  viewport: { width: number; height: number },
) {
  await page.setViewportSize(viewport);
  await page.goto('/');
  await page.getByRole('main').waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function scrollToCenter(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) => {
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
}

async function activateJourneyStep(page: Page, index: number) {
  const viewport = page.viewportSize();

  if (!viewport) {
    throw new Error('Journey scroll tests require an explicit viewport.');
  }

  const stage = page.getByTestId('journey-sticky-stage');
  await stage.waitFor();
  const triggerOffset = await page.evaluate(() => {
    if (window.innerWidth >= 1024) {
      return window.innerHeight * 0.52;
    }

    const header = document.querySelector<HTMLElement>('header');
    const stage = document.querySelector<HTMLElement>(
      '[data-testid="journey-sticky-stage"]',
    );

    if (!header || !stage) {
      throw new Error('Missing compact Journey offset targets.');
    }

    const desired =
      header.getBoundingClientRect().height +
      stage.getBoundingClientRect().height;
    const maximum = Math.max(180, window.innerHeight - 96);
    return Math.min(maximum, Math.max(180, desired));
  });
  const step = page.locator(`[data-journey-index="${index}"]`);

  await step.evaluate((element, offset) => {
    const absoluteTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(0, absoluteTop - offset + 2),
      behavior: 'instant',
    });
  }, triggerOffset);

  await expect(stage).toHaveAttribute('data-active-index', String(index));
  await expect(step).toHaveAttribute('data-active', 'true');
}

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth, label).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

async function expectNoEssentialHorizontalClipping(page: Page, label: string) {
  const clippedElements = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll(
        'main h1, main h2, main h3, main h4, main p, main a, main button, main dt, main dd, main time, footer p, footer a, footer summary',
      ),
    );

    return elements
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const isInsideExplicitHorizontalScroller = Boolean(
          element.closest('header nav, #visuals [aria-label="选择图片"]'),
        );

        return (
          !isInsideExplicitHorizontalScroller &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 2 &&
          rect.height > 2 &&
          (rect.left < -1 || rect.right > window.innerWidth + 1)
        );
      })
      .map((element) => ({
        tag: element.tagName,
        text: (element.textContent ?? '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 80),
      }));
  });

  expect(clippedElements, label).toEqual([]);
}

async function expectMinimumTargetHeight(
  locator: Locator,
  label: string,
  minimum = 44,
) {
  const count = await locator.count();

  for (let index = 0; index < count; index += 1) {
    const box = await locator.nth(index).boundingBox();
    expect(box, `${label} target ${index + 1}`).not.toBeNull();
    expect(
      box?.height ?? 0,
      `${label} target ${index + 1}`,
    ).toBeGreaterThanOrEqual(minimum);
  }
}

async function expectAnchorBelowHeader(page: Page, headingName: string) {
  const geometry = await page.evaluate((name) => {
    const header = document.querySelector('header');
    const heading = Array.from(document.querySelectorAll('h2')).find(
      (candidate) => candidate.textContent?.trim() === name,
    );

    if (!header || !heading) {
      throw new Error(`Missing fixed-header geometry target: ${name}`);
    }

    return {
      headerBottom: header.getBoundingClientRect().bottom,
      headingTop: heading.getBoundingClientRect().top,
    };
  }, headingName);

  expect(geometry.headingTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
}

test('desktop homepage uses factual artist copy and a complete five-album sequence', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花谱' }),
  ).toBeInViewport();
  await expect(
    page.getByText('日本虚拟歌手，KAMITSUBAKI STUDIO 旗下艺人。'),
  ).toBeInViewport();
  await expect(page.getByRole('link', { name: '人物介绍' })).toHaveAttribute(
    'href',
    '#about',
  );
  await expect(
    page.locator('#top').getByRole('link', { name: '代表作品' }),
  ).toHaveAttribute('href', '#works');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page).toHaveTitle('花谱观察站｜认识花谱 KAF');

  for (const heading of [
    '认识花谱',
    '成长轨迹',
    '代表作品',
    '视觉档案',
    '官方入口',
  ]) {
    await expect(
      page.getByRole('heading', { level: 2, name: heading }),
    ).toBeAttached();
  }

  const profile = page.locator('#about');
  await expect(profile.getByText('开始活动', { exact: true })).toBeVisible();
  await expect(profile.getByText('2018 年', { exact: true })).toBeVisible();
  await expect(profile.getByText('出道年龄', { exact: true })).toBeVisible();
  await expect(profile.getByText('14 岁', { exact: true })).toBeVisible();
  await expect(
    profile.getByText('KAMITSUBAKI STUDIO', { exact: true }),
  ).toBeVisible();
  await expect(
    profile.locator('[data-testid="primer-sticky-stage"]'),
  ).toHaveCount(0);
  await expect(profile.locator('[data-primer-index]')).toHaveCount(0);

  const journey = page.locator('#journey');
  await expect(journey.locator('[data-journey-step]')).toHaveCount(6);
  await expect(journey.getByRole('article')).toHaveCount(6);
  await expect(journey.getByRole('tab')).toHaveCount(0);
  await expect(journey.getByRole('button')).toHaveCount(0);
  await expect(
    journey.getByRole('heading', { level: 3, name: '被发现的声音' }),
  ).toBeAttached();
  await expect(
    journey.locator('[data-testid="journey-sticky-stage"]'),
  ).toHaveCount(1);
  await expect(
    journey.locator('[data-testid="journey-sticky-stage"] img'),
  ).toHaveCount(1);
  await expect(journey.locator('[class*="secondaryVisual"]')).toHaveCount(0);

  const works = page.locator('#works');
  await expect(works.getByRole('article')).toHaveCount(5);
  for (const title of ['深愛', '寓話', '狂想β', '魔法α', '観測α']) {
    await expect(works.getByRole('heading', { name: title })).toBeAttached();
  }
  const thirdAlbum = works.getByRole('article').filter({ hasText: '狂想β' });
  await expect(thirdAlbum).toHaveCount(1);
  await expect(thirdAlbum.locator('img')).toHaveCount(0);
  await expect(
    thirdAlbum.getByRole('link', { name: /狂想β的官方页面/ }),
  ).toHaveAttribute(
    'href',
    'https://kaf.kamitsubaki.jp/discography/20230308/199/',
  );

  const bannedCopy = [
    '她从网络里被听见',
    '这里用几分钟讲清',
    '一个从网络深处被发现的声音',
    '虚拟形象是入口',
    '从屏幕里的歌',
    '先听起点',
    '网络中的投稿',
    '第一次被看见',
    'VOICE / IMAGE / MEMORY',
    'KAF / CHRONOLOGY',
    'CURRENT WORK',
    'VISUAL CREDIT',
  ];

  for (const copy of bannedCopy) {
    await expect(page.locator('body')).not.toContainText(copy);
  }

  await expect(page.locator('[class*="eyebrow"]')).toHaveCount(0);
  await expect(page.locator('[data-rhythm]')).toHaveCount(0);
  await expect(
    page
      .getByRole('contentinfo')
      .getByText('图片作者与制作：花譜 / PALOW. / 川サキケンジ / とり'),
  ).toBeVisible();

  const hierarchy = await page.evaluate(() => {
    const readFontSize = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing hierarchy target: ${selector}`);
      return Number.parseFloat(getComputedStyle(element).fontSize);
    };

    const smallVisibleText = Array.from(
      document.querySelectorAll<HTMLElement>('header *, main *, footer *'),
    )
      .filter((element) => {
        const text = element.textContent?.trim();
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          Boolean(text) &&
          element.children.length === 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 2 &&
          rect.height > 2 &&
          Number.parseFloat(style.fontSize) < 14
        );
      })
      .map((element) => ({
        size: Number.parseFloat(getComputedStyle(element).fontSize),
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
      }));

    return {
      bodyFontSize: readFontSize('body'),
      navFontSize: readFontSize('header nav a'),
      sectionHeadingSizes: [
        '#about h2',
        '#journey h2',
        '#works h2',
        '#visuals h2',
      ].map(readFontSize),
      documentHeight: document.documentElement.scrollHeight,
      smallVisibleText,
    };
  });

  expect(hierarchy.bodyFontSize).toBeGreaterThanOrEqual(16);
  expect(hierarchy.navFontSize).toBeGreaterThanOrEqual(14);
  expect(Math.max(...hierarchy.sectionHeadingSizes)).toBeLessThanOrEqual(72);
  expect(hierarchy.documentHeight).toBeLessThan(14_000);
  expect(hierarchy.smallVisibleText).toEqual([]);
});

test('fixed navigation keeps contrast and reports the current page location', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const header = page.getByRole('banner');
  await expect(header).toHaveCSS('position', 'fixed');

  const contrast = await page.evaluate(() => {
    function parse(value: string): [number, number, number, number] {
      const channels = value.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3)
        throw new Error(`Bad color: ${value}`);
      return [
        channels[0] ?? 0,
        channels[1] ?? 0,
        channels[2] ?? 0,
        channels[3] ?? 1,
      ];
    }

    function composite(value: string): [number, number, number] {
      const [r, g, b, a] = parse(value);
      return [
        r * a + 255 * (1 - a),
        g * a + 255 * (1 - a),
        b * a + 255 * (1 - a),
      ];
    }

    function luminance(channels: [number, number, number]) {
      const linear = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      }) as [number, number, number];
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }

    function ratio(
      foreground: [number, number, number],
      background: [number, number, number],
    ) {
      const first = luminance(foreground);
      const second = luminance(background);
      return (
        (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
      );
    }

    const headerElement = document.querySelector<HTMLElement>('header');
    const navLink = document.querySelector<HTMLElement>('header nav a');
    const primaryAction = document.querySelector<HTMLElement>(
      '#top a[href="#about"]',
    );
    if (!headerElement || !navLink || !primaryAction)
      throw new Error('Missing contrast target');

    const headerStyle = getComputedStyle(headerElement);
    const navStyle = getComputedStyle(navLink);
    const actionStyle = getComputedStyle(primaryAction);
    return {
      nav: ratio(
        composite(navStyle.color),
        composite(headerStyle.backgroundColor),
      ),
      action: ratio(
        composite(actionStyle.color),
        composite(actionStyle.backgroundColor),
      ),
    };
  });

  expect(contrast.nav).toBeGreaterThanOrEqual(4.5);
  expect(contrast.action).toBeGreaterThanOrEqual(4.5);

  const navigation = page.getByRole('navigation', {
    name: '花谱观察站页面导航',
  });
  for (const [selector, label] of [
    ['#about', '认识花谱'],
    ['#journey', '成长轨迹'],
    ['#works', '代表作品'],
    ['#visuals', '视觉档案'],
    ['#links', '官方入口'],
  ] as const) {
    await scrollToCenter(page, selector);
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute(
      'aria-current',
      'location',
    );
  }

  await navigation.getByRole('link', { name: '代表作品' }).click();
  await expect(
    page.getByRole('heading', { level: 2, name: '代表作品' }),
  ).toBeInViewport();
  await expectAnchorBelowHeader(page, '代表作品');
});

test('hero selects density-matched generated artwork at DPR 1 and DPR 2', async ({
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  if (typeof baseURL !== 'string')
    throw new Error('Playwright baseURL required');

  for (const density of [1, 2] as const) {
    const context = await browser.newContext({
      baseURL,
      deviceScaleFactor: density,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/');
    const hero = page.locator(
      '#top img[data-media-id="kaihou"][data-media-variant="responsive"]',
    );
    await hero.waitFor();
    const source = await hero.evaluate((element) => {
      const image = element as HTMLImageElement;
      return {
        currentSrc: image.currentSrc,
        src: image.getAttribute('src'),
        srcSet: image.getAttribute('srcset'),
        width: image.getAttribute('width'),
        height: image.getAttribute('height'),
      };
    });
    expect(source.src).toContain('kaihou-2x');
    expect(source.srcSet).toContain('kaihou-4x');
    expect(source.width).toBe('1720');
    expect(source.height).toBe('968');
    expect(source.currentSrc).toContain(
      density === 1 ? 'kaihou-2x' : 'kaihou-4x',
    );
    await context.close();
  }
});

test('journey follows downward and upward native scrolling through all six eras', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const journey = page.locator('#journey');
  const stage = page.getByTestId('journey-sticky-stage');
  const steps = journey.locator('[data-journey-step]');

  await expect(steps).toHaveCount(6);
  await expect(stage).toHaveCSS('position', 'sticky');
  await expect(stage.locator('img')).toHaveCount(1);
  await expect(journey.getByRole('tab')).toHaveCount(0);
  await expect(journey.getByRole('button')).toHaveCount(0);

  for (let index = 0; index < journeyStages.length; index += 1) {
    const stageRecord = journeyStages[index];

    if (!stageRecord) {
      throw new Error(`Missing Journey stage ${index}.`);
    }

    await activateJourneyStep(page, index);
    await expect(page.locator(stageRecord.selector)).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(stage).toContainText(stageRecord.title);
    await expect(stage).toContainText(stageRecord.year);
    await expect(stage.locator('img')).toHaveCount(1);
  }

  await activateJourneyStep(page, 2);
  await expect(stage).toContainText('在无法相聚时重构舞台');
  await activateJourneyStep(page, 1);
  await expect(stage).toContainText('从网络走向现场');

  await expect(journey).not.toContainText('网络中的投稿');
  await expect(journey).not.toContainText('第一次被看见');

  await page.locator('#works article').first().scrollIntoViewIfNeeded();
  await expect(stage).not.toBeInViewport();
});

test('gallery provides eight selectors and localized keyboard lightbox navigation', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });
  await scrollToCenter(page, '#visuals-title');

  const gallery = page.locator('#visuals');
  const thumbnailList = gallery.getByRole('list', { name: '选择图片' });
  const thumbnailButtons = thumbnailList.getByRole('button');
  await expect(thumbnailButtons).toHaveCount(8);
  await expect(
    thumbnailButtons.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    ),
  ).resolves.toEqual(galleryTitles.map((title) => `${title}，显示此图`));

  await thumbnailList.getByRole('button', { name: '不可解，显示此图' }).click();
  const activeStage = gallery.getByRole('button', { name: '不可解，点击放大' });
  await expect(activeStage).toBeVisible();
  await activeStage.click();

  const closeButton = page.getByRole('button', { name: '关闭' });
  await expect(closeButton).toBeVisible();
  await expect(page.getByRole('button', { name: '上一张图片' })).toBeVisible();
  await expect(page.getByRole('button', { name: '下一张图片' })).toBeVisible();
  await expect(
    page.locator('.yarl__slide_image[alt^="黑色舞台上"]'),
  ).toHaveAttribute('src', /fukakai-4x/);

  await page.keyboard.press('ArrowRight');
  await expect(
    gallery.locator('button[aria-label="糸，显示此图"]'),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '放大' }).click();
  await expect(page.getByRole('button', { name: '缩小' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(closeButton).toHaveCount(0);
});

test('gallery reserves generated thumbnails for the rail and atmospheric backdrop', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });
  await scrollToCenter(page, '#visuals-title');

  const gallery = page.locator('#visuals');
  const thumbnailImages = gallery
    .getByRole('list', { name: '选择图片' })
    .locator('img[data-media-variant="thumbnail"]');
  await expect(thumbnailImages).toHaveCount(8);
  for (let index = 0; index < (await thumbnailImages.count()); index += 1) {
    await expect(thumbnailImages.nth(index)).toHaveAttribute('src', /-thumb-/);
    await expect(thumbnailImages.nth(index)).not.toHaveAttribute('srcset');
  }
  const backdropImage = gallery
    .getByTestId('gallery-backdrop')
    .locator('img[data-media-variant="thumbnail"]');
  await expect(backdropImage).toHaveCount(1);
  await expect(backdropImage).toHaveAttribute('src', /-thumb-/);
});

test('mobile profile and guided Journey remain contained, readable, and touch-safe', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花谱' }),
  ).toBeInViewport();
  await expect(page.getByRole('link', { name: '人物介绍' })).toBeInViewport();
  await expectNoHorizontalOverflow(page, '390×844 hero');

  const heroGeometry = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('#top');
    const about = document.querySelector<HTMLElement>('#about');
    const ambient = document.querySelector<HTMLImageElement>(
      '#top img[data-media-variant="thumbnail"]',
    );
    const foreground = document.querySelector<HTMLImageElement>(
      '#top img[data-media-variant="responsive"]',
    );

    if (!hero || !about || !ambient || !foreground) {
      throw new Error('Missing mobile Hero art-direction targets.');
    }

    return {
      aboutTop: about.getBoundingClientRect().top,
      ambientDisplay: getComputedStyle(ambient).display,
      ambientSource: ambient.getAttribute('src'),
      foregroundFit: getComputedStyle(foreground).objectFit,
      heroBottom: hero.getBoundingClientRect().bottom,
      viewportHeight: window.visualViewport?.height ?? window.innerHeight,
    };
  });
  expect(heroGeometry.heroBottom).toBeGreaterThanOrEqual(
    heroGeometry.viewportHeight - 1,
  );
  expect(heroGeometry.aboutTop).toBeGreaterThanOrEqual(
    heroGeometry.viewportHeight - 1,
  );
  expect(heroGeometry.foregroundFit).toBe('contain');
  expect(heroGeometry.ambientDisplay).not.toBe('none');
  expect(heroGeometry.ambientSource).toContain('-thumb');

  await expect(
    page.locator('#about [data-testid="primer-sticky-stage"]'),
  ).toHaveCount(0);
  await expect(page.locator('#about dl')).toBeAttached();

  for (const [label, locator] of [
    [
      'mobile navigation',
      page
        .getByRole('navigation', { name: '花谱观察站页面导航' })
        .getByRole('link'),
    ],
    ['mobile Hero', page.locator('#top').getByRole('link')],
  ] as const) {
    await expectMinimumTargetHeight(locator, label);
  }

  const journey = page.locator('#journey');
  const stage = page.getByTestId('journey-sticky-stage');
  await expect(journey.locator('[data-journey-step]')).toHaveCount(6);
  await expect(journey.getByRole('tab')).toHaveCount(0);
  await expect(journey.getByRole('button')).toHaveCount(0);
  await expect(stage.locator('img')).toHaveCount(1);

  await activateJourneyStep(page, 0);
  await expect(stage).toHaveCSS('position', 'sticky');
  const stageGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>('body > div header');
    const stage = document.querySelector<HTMLElement>(
      '[data-testid="journey-sticky-stage"]',
    );
    const activeStep = document.querySelector<HTMLElement>(
      '[data-journey-step][data-active="true"]',
    );

    if (!header || !stage || !activeStep) {
      throw new Error('Missing mobile Journey geometry targets.');
    }

    const headerRect = header.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const activeStepRect = activeStep.getBoundingClientRect();
    return {
      activeStepTop: activeStepRect.top,
      boxShadow: getComputedStyle(stage).boxShadow,
      headerBottom: headerRect.bottom,
      stageLeft: stageRect.left,
      stageRight: stageRect.right,
      stageTop: stageRect.top,
      stageBottom: stageRect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(
    Math.abs(stageGeometry.stageTop - stageGeometry.headerBottom),
  ).toBeLessThanOrEqual(1.5);
  expect(stageGeometry.stageLeft).toBeLessThanOrEqual(1);
  expect(stageGeometry.stageRight).toBeGreaterThanOrEqual(
    stageGeometry.viewportWidth - 1,
  );
  expect(stageGeometry.boxShadow).toBe('none');
  expect(
    stageGeometry.viewportHeight - stageGeometry.stageBottom,
  ).toBeGreaterThanOrEqual(180);
  expect(stageGeometry.activeStepTop).toBeGreaterThanOrEqual(
    stageGeometry.stageBottom - 3,
  );
  expect(stageGeometry.activeStepTop).toBeLessThan(
    stageGeometry.stageBottom + 16,
  );

  await activateJourneyStep(page, 4);
  await expect(stage).toContainText('进入创作的第二章');
  await activateJourneyStep(page, 2);
  await expect(stage).toContainText('在无法相聚时重构舞台');
  await expectNoHorizontalOverflow(page, '390×844 journey');
});

test('Journey recalibrates its compact trigger after orientation changes', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });
  const stage = page.getByTestId('journey-sticky-stage');

  await activateJourneyStep(page, 2);
  await expect(stage).toHaveAttribute('data-active-index', '2');

  await page.setViewportSize({ width: 844, height: 390 });
  await activateJourneyStep(page, 4);
  await expect(stage).toHaveAttribute('data-active-index', '4');
  await expect(stage).toContainText('进入创作的第二章');

  const landscapeGeometry = await stage.evaluate((element) => {
    const header = document.querySelector<HTMLElement>('header');
    const rect = element.getBoundingClientRect();

    if (!header) {
      throw new Error('Missing landscape header geometry target.');
    }

    return {
      bottom: rect.bottom,
      gap: rect.top - header.getBoundingClientRect().bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });
  expect(landscapeGeometry.height).toBeLessThan(
    landscapeGeometry.viewportHeight,
  );
  expect(
    landscapeGeometry.viewportHeight - landscapeGeometry.bottom,
  ).toBeGreaterThan(120);
  expect(Math.abs(landscapeGeometry.gap)).toBeLessThanOrEqual(1.5);
  expect(landscapeGeometry.left).toBeLessThanOrEqual(1);
  expect(landscapeGeometry.right).toBeGreaterThanOrEqual(
    landscapeGeometry.viewportWidth - 1,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await activateJourneyStep(page, 1);
  await expect(stage).toHaveAttribute('data-active-index', '1');
  await expect(stage).toContainText('从网络走向现场');
  await expectNoHorizontalOverflow(page, 'portrait after orientation return');
});

test('all target viewport sizes remain free of horizontal overflow', async ({
  page,
}) => {
  for (const viewport of targetViewports) {
    await openHome(page, viewport);

    const heroGeometry = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>('#top');
      const about = document.querySelector<HTMLElement>('#about');
      const ambient = document.querySelector<HTMLImageElement>(
        '#top img[data-media-variant="thumbnail"]',
      );
      const foreground = document.querySelector<HTMLImageElement>(
        '#top img[data-media-variant="responsive"]',
      );

      if (!hero || !about || !ambient || !foreground) {
        throw new Error('Missing viewport Hero geometry targets.');
      }

      return {
        aboutTop: about.getBoundingClientRect().top,
        ambientDisplay: getComputedStyle(ambient).display,
        foregroundFit: getComputedStyle(foreground).objectFit,
        heroBottom: hero.getBoundingClientRect().bottom,
        viewportHeight: window.visualViewport?.height ?? window.innerHeight,
      };
    });
    expect(
      heroGeometry.heroBottom,
      `${viewport.width}×${viewport.height} Hero coverage`,
    ).toBeGreaterThanOrEqual(heroGeometry.viewportHeight - 1);
    expect(
      heroGeometry.aboutTop,
      `${viewport.width}×${viewport.height} next-section boundary`,
    ).toBeGreaterThanOrEqual(heroGeometry.viewportHeight - 1);

    const usesPortraitArtDirection =
      viewport.width <= 896 && viewport.height > viewport.width;

    if (usesPortraitArtDirection) {
      expect(heroGeometry.foregroundFit).toBe('contain');
      expect(heroGeometry.ambientDisplay).not.toBe('none');
    }

    await expectNoHorizontalOverflow(
      page,
      `${viewport.width}×${viewport.height} top`,
    );
    await expectNoEssentialHorizontalClipping(
      page,
      `${viewport.width}×${viewport.height} essential content`,
    );
    await expect(
      page.locator('[data-testid="primer-sticky-stage"]'),
    ).toHaveCount(0);
    await expect(page.locator('#journey [data-journey-step]')).toHaveCount(6);
    await expect(page.getByTestId('journey-sticky-stage')).toHaveCount(1);
    await expect(
      page.getByTestId('journey-sticky-stage').locator('img'),
    ).toHaveCount(1);

    await activateJourneyStep(page, 0);
    const stageGeometry = await page
      .getByTestId('journey-sticky-stage')
      .evaluate((stage) => {
        const header = document.querySelector<HTMLElement>('header');
        const rect = stage.getBoundingClientRect();

        if (!header) {
          throw new Error('Missing viewport header geometry target.');
        }

        return {
          bottom: rect.bottom,
          gap: rect.top - header.getBoundingClientRect().bottom,
          height: rect.height,
          left: rect.left,
          position: getComputedStyle(stage).position,
          right: rect.right,
          top: rect.top,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      });
    expect(stageGeometry.position).toBe('sticky');
    expect(stageGeometry.height).toBeLessThan(stageGeometry.viewportHeight);

    if (viewport.width < 1024) {
      expect(
        Math.abs(stageGeometry.gap),
        `${viewport.width}×${viewport.height} header/stage seam`,
      ).toBeLessThanOrEqual(1.5);
      expect(stageGeometry.left).toBeLessThanOrEqual(1);
      expect(stageGeometry.right).toBeGreaterThanOrEqual(
        stageGeometry.viewportWidth - 1,
      );
    }

    if (viewport.height <= 430) {
      expect(
        stageGeometry.viewportHeight - stageGeometry.bottom,
      ).toBeGreaterThan(120);
    } else if (viewport.width < 1024) {
      expect(
        stageGeometry.viewportHeight - stageGeometry.bottom,
      ).toBeGreaterThanOrEqual(180);
    }

    if (viewport.width < 1024) {
      await expectMinimumTargetHeight(
        page
          .getByRole('navigation', { name: '花谱观察站页面导航' })
          .getByRole('link'),
        `${viewport.width}×${viewport.height} navigation`,
      );
      await expectMinimumTargetHeight(
        page.locator('#top').getByRole('link'),
        `${viewport.width}×${viewport.height} Hero`,
      );
      await expectMinimumTargetHeight(
        page.locator('#works').getByRole('link'),
        `${viewport.width}×${viewport.height} Works`,
      );
      await expectMinimumTargetHeight(
        page.locator('#visuals').getByRole('button'),
        `${viewport.width}×${viewport.height} Gallery`,
      );
      await expectMinimumTargetHeight(
        page.locator('#links').getByRole('link'),
        `${viewport.width}×${viewport.height} official links`,
      );
    }

    for (const selector of pageSections) {
      await scrollToCenter(page, selector);
      await expectNoHorizontalOverflow(
        page,
        `${viewport.width}×${viewport.height} ${selector}`,
      );
    }
  }
});

test('large user text preferences preserve essential reflow and guided Journey', async ({
  page,
}) => {
  await openHome(page, { width: 640, height: 900 });
  await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });
  await page.waitForTimeout(120);

  await expectNoHorizontalOverflow(page, '640×900 with 200% root text');
  await expectNoEssentialHorizontalClipping(
    page,
    '640×900 with 200% root text essential content',
  );
  await expect(page.locator('#journey [data-journey-step]')).toHaveCount(6);
  await expect(page.locator('#journey').getByRole('tab')).toHaveCount(0);
  await expect(
    page.getByTestId('journey-sticky-stage').locator('img'),
  ).toHaveCount(1);
  await activateJourneyStep(page, 2);
  await expect(page.getByTestId('journey-sticky-stage')).toHaveAttribute(
    'data-active-index',
    '2',
  );
  const largeTextJourneyGeometry = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(
      '[data-testid="journey-sticky-stage"]',
    );
    const activeStep = document.querySelector<HTMLElement>(
      '[data-journey-index="2"]',
    );

    if (!stage || !activeStep) {
      throw new Error('Missing 200% Journey geometry targets.');
    }

    return {
      activeStepTop: activeStep.getBoundingClientRect().top,
      stageBottom: stage.getBoundingClientRect().bottom,
    };
  });
  expect(largeTextJourneyGeometry.activeStepTop).toBeGreaterThanOrEqual(
    largeTextJourneyGeometry.stageBottom - 3,
  );

  for (const selector of pageSections) {
    await scrollToCenter(page, selector);
    await expectNoHorizontalOverflow(
      page,
      `640×900 with 200% root text ${selector}`,
    );
  }
});

test('reduced motion renders every Journey era and image in normal flow', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await openHome(page, viewport);

    await expect(page.locator('#about dl')).toBeAttached();
    await expect(page.getByTestId('journey-sticky-stage')).toHaveCount(0);
    await expect(page.locator('#journey [data-journey-step]')).toHaveCount(6);
    await expect(page.locator('#journey [data-journey-step] img')).toHaveCount(
      6,
    );
    await expect(page.locator('#journey').getByRole('tab')).toHaveCount(0);
    await expect(page.locator('#journey').getByRole('button')).toHaveCount(0);

    for (const stageRecord of journeyStages) {
      await expect(
        page.getByRole('heading', { level: 3, name: stageRecord.title }),
      ).toBeAttached();
    }

    const firstStepState = await page
      .locator('[data-journey-index="0"]')
      .evaluate((element) => {
        const style = getComputedStyle(element);
        return { opacity: style.opacity, transform: style.transform };
      });
    expect(firstStepState).toEqual({ opacity: '1', transform: 'none' });

    const heroMotionState = await page
      .locator('#top h1')
      .evaluate((element) => {
        const animatedParent = element.parentElement;
        if (!animatedParent) return null;
        const style = getComputedStyle(animatedParent);
        return { opacity: style.opacity, transform: style.transform };
      });
    expect(heroMotionState).toEqual({ opacity: '1', transform: 'none' });
    await expectNoHorizontalOverflow(
      page,
      `${viewport.width}×${viewport.height} reduced motion`,
    );
  }
});

test('only the hero image is eager and responsive candidates remain explicit', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const imageLoading = await page.locator('img').evaluateAll((images) =>
    images.map((image) => ({
      fetchPriority: image.getAttribute('fetchpriority'),
      height: image.getAttribute('height'),
      loading: image.getAttribute('loading'),
      mediaVariant: image.getAttribute('data-media-variant'),
      src: image.getAttribute('src'),
      srcSet: image.getAttribute('srcset'),
      width: image.getAttribute('width'),
    })),
  );
  const eagerImages = imageLoading.filter((image) => image.loading === 'eager');
  expect(eagerImages).toHaveLength(1);
  expect(eagerImages[0]?.fetchPriority).toBe('high');
  expect(eagerImages[0]?.src).toContain('kaihou-2x');
  expect(eagerImages[0]?.srcSet).toContain('kaihou-4x');

  for (const image of imageLoading) {
    expect(Number(image.width)).toBeGreaterThan(0);
    expect(Number(image.height)).toBeGreaterThan(0);
    if (image !== eagerImages[0]) {
      expect(image.loading).toBe('lazy');
      expect(image.fetchPriority).not.toBe('high');
    }
    if (image.mediaVariant === 'responsive') {
      expect(image.src).toContain('-2x');
      expect(image.srcSet).toContain('-4x');
    }
    if (image.mediaVariant === 'thumbnail') {
      expect(image.src).toContain('-thumb');
      expect(image.srcSet).toBeNull();
    }
  }
});

test('captures the responsive guided-Journey visual evidence', async ({
  page,
}) => {
  const evidenceDirectory = 'test-results/kaf-round6-guided-journey';

  await openHome(page, { width: 1440, height: 900 });
  await page.screenshot({ path: `${evidenceDirectory}/1440x900-hero.png` });

  await scrollToCenter(page, '#about');
  await page.screenshot({ path: `${evidenceDirectory}/1440x900-profile.png` });

  await activateJourneyStep(page, 3);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-guided-journey.png`,
  });

  await scrollToCenter(page, '#works');
  await page.screenshot({ path: `${evidenceDirectory}/1440x900-works.png` });

  await openHome(page, { width: 390, height: 844 });
  await page.screenshot({ path: `${evidenceDirectory}/390x844-hero.png` });
  await activateJourneyStep(page, 2);
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-guided-journey.png`,
  });

  await openHome(page, { width: 844, height: 390 });
  await activateJourneyStep(page, 4);
  await page.screenshot({
    path: `${evidenceDirectory}/844x390-guided-journey.png`,
  });
});
