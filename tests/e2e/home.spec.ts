import { expect, test, type Locator, type Page } from '@playwright/test';

import { kafAvatarAsset } from '../../src/content/kafAvatar';

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
  '#avatar',
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

async function waitForJourneyVisual(page: Page, index: number) {
  const stage = page.getByTestId('journey-sticky-stage');
  await expect(stage).toHaveAttribute(
    'data-displayed-visual-index',
    String(index),
  );
  await expect(stage).toHaveAttribute('data-stage-load-status', 'idle');
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

async function expectSingleRenderedLine(locator: Locator, label: string) {
  await expect(locator).toBeVisible();

  const lineCount = await locator.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);

    return new Set(
      Array.from(range.getClientRects()).map(
        (rect) => Math.round(rect.top * 10) / 10,
      ),
    ).size;
  });

  expect(lineCount, label).toBe(1);
}

async function expectAnchorBelowHeader(page: Page, headingName: string) {
  await expect
    .poll(async () => {
      return page.evaluate((name) => {
        const header = document.querySelector('header');
        const heading = Array.from(document.querySelectorAll('h2')).find(
          (candidate) => candidate.textContent?.trim() === name,
        );

        if (!header || !heading) {
          throw new Error(`Missing fixed-header geometry target: ${name}`);
        }

        return (
          heading.getBoundingClientRect().top -
          header.getBoundingClientRect().bottom
        );
      }, headingName);
    })
    .toBeGreaterThanOrEqual(-1);
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
    '动态形象',
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
  const thirdAlbumCover = thirdAlbum.getByRole('img', {
    name: /花谱第三张专辑《狂想β》封面/,
  });
  await expect(thirdAlbumCover).toHaveCount(1);
  await expect(thirdAlbumCover).toHaveAttribute(
    'data-media-id',
    'kyousou-beta',
  );
  await expect(thirdAlbumCover).toHaveAttribute(
    'srcset',
    /kyousou-beta-(?:thumb|display|high)/,
  );
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
        '#avatar h2',
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

test('system typography preserves reading, display, and Japanese-name roles without webfonts', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const typography = await page.evaluate(() => {
    const readFamily = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);

      if (!element) {
        throw new Error(`Missing typography target: ${selector}`);
      }

      return getComputedStyle(element).fontFamily;
    };

    const fontResources = performance
      .getEntriesByType('resource')
      .map((entry) => entry.toJSON())
      .filter((entry) =>
        /\.(?:woff2?|ttf|otf)$/i.test(new URL(String(entry.name)).pathname),
      );

    return {
      bodyFamily: readFamily('body'),
      heroFamily: readFamily('#top h1'),
      identityFamily: readFamily('#top [class*="identityLine"]'),
      sectionFamily: readFamily('#about h2'),
      workTitleFamily: readFamily('#works h3'),
      galleryTitleFamily: readFamily('#visuals h3'),
      journeyYearFamily: readFamily('#journey [data-journey-step] header p'),
      fontRequestCount: fontResources.length,
      fontTransferBytes: fontResources.reduce(
        (sum, entry) => sum + (entry.transferSize || 0),
        0,
      ),
    };
  });

  expect(typography.bodyFamily).toContain('PingFang SC');
  expect(typography.bodyFamily).toContain('system-ui');
  expect(typography.heroFamily).toContain('Songti SC');
  expect(typography.identityFamily).toContain('Hiragino Mincho ProN');
  expect(typography.sectionFamily).toContain('Songti SC');
  expect(typography.workTitleFamily).toContain('Hiragino Mincho ProN');
  expect(typography.galleryTitleFamily).toContain('Hiragino Mincho ProN');
  expect(typography.journeyYearFamily).toContain('Iowan Old Style');
  expect(typography.fontRequestCount).toBe(0);
  expect(typography.fontTransferBytes).toBe(0);
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
    ['#avatar', '动态形象'],
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

test('dynamic avatar defers its model request and keeps a usable poster on failure', async ({
  page,
}) => {
  let modelRequests = 0;
  await page.route(`**${kafAvatarAsset.publicPath}`, async (route) => {
    modelRequests += 1;
    await route.fulfill({
      status: 503,
      contentType: 'text/plain; charset=utf-8',
      body: 'test proxy unavailable',
    });
  });

  await openHome(page, { width: 1440, height: 900 });

  expect(modelRequests).toBe(0);
  await expect(page.locator('#avatar')).toBeAttached();
  await expect(
    page.locator('#avatar').getByRole('img', { name: /花谱 VRM 模型预览/ }),
  ).toBeAttached();

  await scrollToCenter(page, '#avatar');
  await expect.poll(() => modelRequests).toBe(1);
  await expect(page.getByTestId('kaf-avatar-stage')).toHaveAttribute(
    'data-status',
    'error',
  );
  await expect(
    page.locator('#avatar').getByRole('img', { name: /花谱 VRM 模型预览/ }),
  ).toBeVisible();
  await expect(
    page.locator('#avatar').getByRole('button', { name: '重新加载' }),
  ).toBeVisible();
  await expect(
    page.locator('#avatar').getByRole('link', { name: '下载 VRM 模型' }),
  ).toHaveAttribute('href', kafAvatarAsset.publicPath);
});

test('reduced motion keeps the avatar static until the visitor explicitly loads it', async ({
  page,
}) => {
  let modelRequests = 0;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(`**${kafAvatarAsset.publicPath}`, async (route) => {
    modelRequests += 1;
    await route.fulfill({ status: 503, body: 'test proxy unavailable' });
  });

  await openHome(page, { width: 390, height: 844 });
  await scrollToCenter(page, '#avatar');
  await page.waitForTimeout(250);

  expect(modelRequests).toBe(0);
  const loadButton = page
    .locator('#avatar')
    .getByRole('button', { name: '加载动态形象' });
  await expect(loadButton).toBeVisible();
  await loadButton.click();
  await expect.poll(() => modelRequests).toBe(1);
  await expect(page.getByTestId('kaf-avatar-stage')).toHaveAttribute(
    'data-status',
    'error',
  );
});

test('hero selects a right-sized responsive candidate across desktop and mobile DPR', async ({
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  if (typeof baseURL !== 'string')
    throw new Error('Playwright baseURL required');

  for (const scenario of [
    {
      density: 1,
      viewport: { width: 1440, height: 900 },
      expectedCandidate: 'kaihou-large',
    },
    {
      density: 2,
      viewport: { width: 1440, height: 900 },
      expectedCandidate: 'kaihou-high',
    },
    {
      density: 2,
      viewport: { width: 390, height: 844 },
      expectedCandidate: 'kaihou-medium',
    },
    {
      density: 3,
      viewport: { width: 390, height: 844 },
      expectedCandidate: 'kaihou-display',
    },
  ] as const) {
    const context = await browser.newContext({
      baseURL,
      deviceScaleFactor: scenario.density,
      viewport: scenario.viewport,
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
    expect(source.src).toContain('kaihou-display');
    expect(source.srcSet).toContain('kaihou-thumb');
    expect(source.srcSet).toContain('480w');
    expect(source.srcSet).toContain('kaihou-medium');
    expect(source.srcSet).toContain('960w');
    expect(source.srcSet).toContain('kaihou-display');
    expect(source.srcSet).toContain('1280w');
    expect(source.srcSet).toContain('kaihou-large');
    expect(source.srcSet).toContain('1920w');
    expect(source.srcSet).toContain('kaihou-high');
    expect(source.srcSet).toContain('2560w');
    expect(source.width).toBe('1280');
    expect(source.height).toBe('720');
    expect(source.currentSrc).toContain(scenario.expectedCandidate);
    await context.close();
  }
});

test('slow image responses keep visible feedback and stable layout before reveal', async ({
  page,
}) => {
  let releaseHero: () => void = () => {};
  let releaseThirdAlbum: () => void = () => {};
  const heroGate = new Promise<void>((resolve) => {
    releaseHero = resolve;
  });
  const thirdAlbumGate = new Promise<void>((resolve) => {
    releaseThirdAlbum = resolve;
  });
  let heroRequestIntercepted = false;
  let thirdAlbumRequestIntercepted = false;

  await page.addInitScript(() => {
    Object.defineProperty(HTMLImageElement.prototype, 'decode', {
      configurable: true,
      value: () =>
        new Promise<void>(() => {
          // Intentionally unresolved: native load must still reveal the image.
        }),
    });
  });

  await page.route(
    /\/assets\/kaihou-(?:medium|display|large|high)-[^/]+\.webp$/,
    async (route) => {
      heroRequestIntercepted = true;
      const response = await route.fetch();
      await heroGate;
      await route.fulfill({ response });
    },
  );
  await page.route(
    /\/assets\/kyousou-beta-(?:thumb|medium|display|large|high)-[^/]+\.webp$/,
    async (route) => {
      thirdAlbumRequestIntercepted = true;
      const response = await route.fetch();
      await thirdAlbumGate;
      await route.fulfill({ response });
    },
  );

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('main').waitFor();

  const heroShell = page.locator(
    '#top [data-artwork-id="kaihou"][data-artwork-variant="responsive"]',
  );
  await expect(page.locator('#top img[data-media-id="kaihou"]')).toHaveCount(1);
  await expect(heroShell).toHaveAttribute('data-artwork-status', 'loading');
  await expect(heroShell).toHaveAttribute('aria-busy', 'true');
  await expect(heroShell.locator('img')).toHaveCSS('opacity', '0');
  await expect(heroShell.getByText('图片加载中')).toBeVisible();
  const placeholder = await heroShell.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--artwork-placeholder').trim(),
  );
  expect(placeholder).toContain('data:image/webp;base64');
  const heroBefore = await heroShell.boundingBox();
  expect(heroRequestIntercepted).toBe(true);

  releaseHero();
  await expect(heroShell).toHaveAttribute('data-artwork-status', 'loaded');
  await expect(heroShell).not.toHaveAttribute('aria-busy');
  await expect(heroShell.locator('img')).toHaveCSS('opacity', '1');
  const heroAfter = await heroShell.boundingBox();
  expect(heroBefore).not.toBeNull();
  expect(heroAfter).not.toBeNull();
  expect(
    Math.abs((heroAfter?.width ?? 0) - (heroBefore?.width ?? 0)),
  ).toBeLessThan(1);
  expect(
    Math.abs((heroAfter?.height ?? 0) - (heroBefore?.height ?? 0)),
  ).toBeLessThan(1);

  const thirdAlbum = page
    .locator('#works article')
    .filter({ hasText: '狂想β' });
  await thirdAlbum.scrollIntoViewIfNeeded();
  const thirdAlbumShell = thirdAlbum.locator(
    '[data-artwork-id="kyousou-beta"][data-artwork-variant="responsive"]',
  );
  await expect(thirdAlbumShell).toHaveAttribute(
    'data-artwork-status',
    'loading',
  );
  await expect(thirdAlbumShell.getByText('图片加载中')).toBeVisible();
  await expect(thirdAlbumShell.locator('img')).toHaveAttribute(
    'srcset',
    /kyousou-beta-thumb.*480w.*kyousou-beta-medium.*960w.*kyousou-beta-display.*1200w.*kyousou-beta-large.*1440w.*kyousou-beta-high.*1600w/,
  );
  await expect.poll(() => thirdAlbumRequestIntercepted).toBe(true);

  releaseThirdAlbum();
  await expect(thirdAlbumShell).toHaveAttribute(
    'data-artwork-status',
    'loaded',
  );
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
    await waitForJourneyVisual(page, index);
    await expect(page.locator(stageRecord.selector)).toHaveAttribute(
      'data-active',
      'true',
    );
    await expect(stage).toContainText(stageRecord.title);
    await expect(stage).toContainText(stageRecord.year);
    await expect(stage.locator('img')).toHaveCount(1);
  }

  await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>(
      '[data-testid="journey-sticky-stage"]',
    );
    if (!stage) throw new Error('Missing Journey stage for cache audit.');

    const auditWindow = window as typeof window & {
      __journeyLoadingAudit?: {
        values: string[];
        observer: MutationObserver;
      };
    };
    const values: string[] = [];
    const record = () => {
      values.push(stage.getAttribute('data-stage-load-status') ?? '');
      for (const shell of stage.querySelectorAll<HTMLElement>(
        '[data-artwork-status]',
      )) {
        values.push(shell.getAttribute('data-artwork-status') ?? '');
      }
    };
    const observer = new MutationObserver(record);
    observer.observe(stage, {
      attributes: true,
      attributeFilter: ['data-stage-load-status', 'data-artwork-status'],
      childList: true,
      subtree: true,
    });
    record();
    auditWindow.__journeyLoadingAudit = { values, observer };
  });

  for (const index of [4, 3, 2, 1, 0]) {
    await activateJourneyStep(page, index);
    await waitForJourneyVisual(page, index);
    await expect(stage.locator('[data-artwork-status="loading"]')).toHaveCount(
      0,
    );
  }

  const cachedTransitionStates = await page.evaluate(() => {
    const auditWindow = window as typeof window & {
      __journeyLoadingAudit?: {
        values: string[];
        observer: MutationObserver;
      };
    };
    const audit = auditWindow.__journeyLoadingAudit;
    audit?.observer.disconnect();
    return audit?.values ?? [];
  });
  expect(cachedTransitionStates).not.toContain('loading');

  await activateJourneyStep(page, 2);
  await waitForJourneyVisual(page, 2);
  await expect(stage).toContainText('在无法相聚时重构舞台');
  await expectSingleRenderedLine(
    stage.locator('strong'),
    'desktop Journey stage title should use its full line',
  );
  await activateJourneyStep(page, 3);
  await waitForJourneyVisual(page, 3);
  await expectSingleRenderedLine(
    stage.locator('strong'),
    'desktop 武道馆 stage title should not orphan characters',
  );
  await activateJourneyStep(page, 1);
  await waitForJourneyVisual(page, 1);
  await expect(stage).toContainText('从网络走向现场');

  await expect(journey).not.toContainText('网络中的投稿');
  await expect(journey).not.toContainText('第一次被看见');

  await page.locator('#works article').first().scrollIntoViewIfNeeded();
  await expect(stage).not.toBeInViewport();
});

test('Journey keeps the previous clear image while an uncached next era transfers', async ({
  page,
}) => {
  let releaseNextImage: () => void = () => {};
  const nextImageGate = new Promise<void>((resolve) => {
    releaseNextImage = resolve;
  });
  let interceptedRequests = 0;

  await page.route(
    /\/assets\/observation-past-(?:medium|display|large|high)-[^/]+\.webp$/,
    async (route) => {
      interceptedRequests += 1;
      await nextImageGate;
      await route.continue();
    },
  );

  await openHome(page, { width: 1440, height: 900 });
  const stage = page.getByTestId('journey-sticky-stage');
  await expect.poll(() => interceptedRequests).toBe(1);

  await activateJourneyStep(page, 0);
  await waitForJourneyVisual(page, 0);
  await expect(stage.locator('[data-artwork-id="origin-ito"]')).toHaveAttribute(
    'data-artwork-status',
    'loaded',
  );
  expect(interceptedRequests).toBe(1);

  await activateJourneyStep(page, 1);
  await expect(stage).toHaveAttribute('data-active-index', '1');
  await expect(stage).toHaveAttribute('data-displayed-visual-index', '0');
  await expect(stage).toHaveAttribute('data-stage-load-status', 'loading');
  await expect(stage).toContainText('下一阶段图片加载中');
  const retainedImage = stage.locator('img[data-media-id="origin-ito"]');
  await expect(retainedImage).toHaveCount(1);
  await expect(retainedImage).toHaveCSS('opacity', '1');
  await expect(stage.locator('[data-artwork-status="loading"]')).toHaveCount(0);

  releaseNextImage();
  await waitForJourneyVisual(page, 1);
  await expect(
    stage.locator('[data-artwork-id="observation-past"]'),
  ).toHaveAttribute('data-artwork-status', 'loaded');
  await expect(stage.locator('[data-artwork-status="loading"]')).toHaveCount(0);
  await expect(stage).not.toContainText('下一阶段图片加载中');

  await activateJourneyStep(page, 0);
  await waitForJourneyVisual(page, 0);
  await expect(stage).toHaveAttribute('data-stage-load-status', 'idle');
  await expect(stage.locator('[data-artwork-status="loading"]')).toHaveCount(0);
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
  ).toHaveAttribute('src', /fukakai-high/);

  await page.keyboard.press('ArrowRight');
  await expect(
    gallery.locator('button[aria-label="糸，显示此图"]'),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '放大' }).click();
  await expect(page.getByRole('button', { name: '缩小' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(closeButton).toHaveCount(0);
});

test('gallery thumbnail selection preserves the reader viewport across animated changes', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  const gallery = page.locator('#visuals');
  const thumbnailList = gallery.getByRole('list', { name: '选择图片' });

  await thumbnailList.evaluate((list) => {
    const rect = list.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    window.scrollTo({
      top: absoluteTop - (window.innerHeight - rect.height) / 2,
      behavior: 'instant',
    });
    list.scrollLeft = 0;
  });
  const scrollYBeforeSelection = await page.evaluate(() => window.scrollY);

  const selectThumbnail = async (title: string) => {
    const target = thumbnailList.getByRole('button', {
      name: `${title}，显示此图`,
    });
    await target.evaluate((button) => {
      const list = button.closest('[aria-label="选择图片"]');

      if (!(list instanceof HTMLElement)) {
        throw new Error('Gallery thumbnail rail is missing.');
      }

      const listRect = list.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      list.scrollTo({
        left:
          list.scrollLeft +
          buttonRect.left -
          listRect.left -
          (listRect.width - buttonRect.width) / 2,
        behavior: 'instant',
      });
    });

    const clickPoint = await target.evaluate((button) => {
      const rect = button.getBoundingClientRect();
      const x = Math.round(rect.left + rect.width / 2);
      const y = Math.round(rect.top + Math.min(16, rect.height / 2));
      const hitTarget = document.elementFromPoint(x, y);

      return hitTarget === button || (hitTarget && button.contains(hitTarget))
        ? { x, y }
        : null;
    });

    if (!clickPoint) {
      throw new Error(`${title} must have a visible pointer target.`);
    }

    await page.mouse.click(clickPoint.x, clickPoint.y);
    await expect(
      gallery.getByRole('button', { name: `${title}，点击放大` }),
    ).toBeVisible();

    // The defect happens when the 420ms keyed backdrop exit completes.
    await page.waitForTimeout(600);
    expect(await page.evaluate(() => window.scrollY)).toBe(
      scrollYBeforeSelection,
    );
  };

  await selectThumbnail('忘れてしまえ');
  await selectThumbnail('ユーフォーを見にいこう');
});

test('gallery lightbox navigation preserves the reader viewport and restores focus', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  const gallery = page.locator('#visuals');
  await gallery
    .getByRole('list', { name: '选择图片' })
    .getByRole('button', { name: '忘れてしまえ，显示此图' })
    .click();
  const stage = gallery.getByRole('button', {
    name: '忘れてしまえ，点击放大',
  });
  await stage.evaluate((button) => {
    const absoluteBottom =
      button.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({
      top: absoluteBottom - 180,
      behavior: 'instant',
    });
  });

  const scrollYBeforeOpen = await page.evaluate(() => window.scrollY);
  const clickPoint = await stage.evaluate((button) => {
    const rect = button.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const visibleTop = Math.max(0, Math.ceil(rect.top));
    const visibleBottom = Math.min(window.innerHeight, Math.floor(rect.bottom));

    for (let y = visibleBottom - 1; y >= visibleTop; y -= 4) {
      const hitTarget = document.elementFromPoint(x, y);
      if (hitTarget === button || (hitTarget && button.contains(hitTarget))) {
        return { x, y };
      }
    }

    return null;
  });
  if (!clickPoint) {
    throw new Error('Gallery stage must have a visible pointer target.');
  }
  await page.mouse.click(clickPoint.x, clickPoint.y);

  const closeButton = page.getByRole('button', { name: '关闭' });
  await expect(closeButton).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/yarl__no_scroll/);

  await page.keyboard.press('ArrowRight');
  const selectedThumbnail = gallery.locator(
    'button[aria-label="不可解，显示此图"]',
  );
  await expect(selectedThumbnail).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollYBeforeOpen);

  await page.keyboard.press('Escape');
  await expect(closeButton).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveClass(/yarl__no_scroll/);

  const updatedStage = gallery.getByRole('button', {
    name: '不可解，点击放大',
  });
  await expect(updatedStage).toBeFocused();

  // Cover delayed Motion completion as well as immediate focus restoration.
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollYBeforeOpen);
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
  await expect(gallery.getByTestId('gallery-backdrop')).toHaveCSS(
    'overflow-anchor',
    'none',
  );
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
    const artwork = document.querySelector<HTMLElement>(
      '#top [data-artwork-id="kaihou"][data-artwork-variant="responsive"]',
    );
    const foreground = artwork?.querySelector<HTMLImageElement>('img');

    if (!hero || !about || !artwork || !foreground) {
      throw new Error('Missing mobile Hero art-direction targets.');
    }

    return {
      aboutTop: about.getBoundingClientRect().top,
      foregroundFit: getComputedStyle(foreground).objectFit,
      heroBottom: hero.getBoundingClientRect().bottom,
      imageCount: hero.querySelectorAll('img').length,
      placeholderImage: getComputedStyle(artwork)
        .getPropertyValue('--artwork-placeholder')
        .trim(),
      placeholderOpacity: Number(getComputedStyle(artwork, '::before').opacity),
      preservesPlaceholder:
        artwork.getAttribute('data-preserve-placeholder') === 'true',
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
  expect(heroGeometry.imageCount).toBe(1);
  expect(heroGeometry.preservesPlaceholder).toBe(true);
  expect(heroGeometry.placeholderImage).toContain('data:image/webp;base64');
  expect(heroGeometry.placeholderOpacity).toBeGreaterThan(0);

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
      const artwork = document.querySelector<HTMLElement>(
        '#top [data-artwork-id="kaihou"][data-artwork-variant="responsive"]',
      );
      const foreground = artwork?.querySelector<HTMLImageElement>('img');

      if (!hero || !about || !artwork || !foreground) {
        throw new Error('Missing viewport Hero geometry targets.');
      }

      return {
        aboutTop: about.getBoundingClientRect().top,
        foregroundFit: getComputedStyle(foreground).objectFit,
        heroBottom: hero.getBoundingClientRect().bottom,
        imageCount: hero.querySelectorAll('img').length,
        placeholderImage: getComputedStyle(artwork)
          .getPropertyValue('--artwork-placeholder')
          .trim(),
        placeholderOpacity: Number(
          getComputedStyle(artwork, '::before').opacity,
        ),
        preservesPlaceholder:
          artwork.getAttribute('data-preserve-placeholder') === 'true',
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
      expect(heroGeometry.imageCount).toBe(1);
      expect(heroGeometry.preservesPlaceholder).toBe(true);
      expect(heroGeometry.placeholderImage).toContain('data:image/webp;base64');
      expect(heroGeometry.placeholderOpacity).toBeGreaterThan(0);
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

    for (const title of ['在无法相聚时重构舞台', '把虚拟歌声带进武道馆']) {
      await expectSingleRenderedLine(
        page.locator('#journey').getByRole('heading', {
          level: 3,
          name: title,
        }),
        `${viewport.width}×${viewport.height} Journey title: ${title}`,
      );
    }

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
    const journeyLoading = await page
      .locator('#journey [data-journey-step] img')
      .evaluateAll((images) =>
        images.map((image) => image.getAttribute('loading')),
      );
    expect(journeyLoading).toEqual(Array(6).fill('lazy'));
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

test('image discovery and priority follow the page reading order', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const heroPreload = page.locator('link[rel="preload"][as="image"]');
  await expect(heroPreload).toHaveCount(1);
  await expect(heroPreload).toHaveAttribute('href', /kaihou-display/);
  await expect(heroPreload).toHaveAttribute(
    'imagesrcset',
    /kaihou-thumb.*480w/,
  );
  await expect(heroPreload).toHaveAttribute(
    'imagesrcset',
    /kaihou-medium.*960w/,
  );
  await expect(heroPreload).toHaveAttribute(
    'imagesrcset',
    /kaihou-display.*1280w/,
  );
  await expect(heroPreload).toHaveAttribute(
    'imagesrcset',
    /kaihou-large.*1920w/,
  );
  await expect(heroPreload).toHaveAttribute(
    'imagesrcset',
    /kaihou-high.*2560w/,
  );
  await expect(heroPreload).toHaveAttribute('imagesizes', '100vw');
  await expect(heroPreload).toHaveAttribute('fetchpriority', 'high');

  const imageLoading = await page.locator('img').evaluateAll((images) =>
    images.map((image) => ({
      fetchPriority: image.getAttribute('fetchpriority'),
      height: image.getAttribute('height'),
      loading: image.getAttribute('loading'),
      mediaVariant: image.getAttribute('data-media-variant'),
      sizes: image.getAttribute('sizes'),
      src: image.getAttribute('src'),
      srcSet: image.getAttribute('srcset'),
      width: image.getAttribute('width'),
    })),
  );
  const eagerImages = imageLoading.filter((image) => image.loading === 'eager');
  expect(eagerImages).toHaveLength(2);
  expect(eagerImages.map((image) => image.src)).toEqual(
    expect.arrayContaining([
      expect.stringContaining('kaihou-display'),
      expect.stringContaining('wasurete-shimae-display'),
    ]),
  );
  const highPriorityImages = imageLoading.filter(
    (image) => image.fetchPriority === 'high',
  );
  expect(highPriorityImages).toHaveLength(1);
  expect(highPriorityImages[0]?.src).toContain('kaihou-display');
  expect(highPriorityImages[0]?.srcSet).toContain('kaihou-high');

  for (const image of imageLoading) {
    expect(Number(image.width)).toBeGreaterThan(0);
    expect(Number(image.height)).toBeGreaterThan(0);
    if (!eagerImages.includes(image)) {
      expect(image.loading).toBe('lazy');
    }
    if (image !== highPriorityImages[0]) {
      expect(image.fetchPriority).not.toBe('high');
    }
    if (image.mediaVariant === 'responsive') {
      expect(image.srcSet).toContain('w');
      expect(image.srcSet).not.toContain(' 1x');
      expect(image.srcSet).not.toContain(' 2x');
      expect(image.sizes).not.toBeNull();
    }
    if (image.mediaVariant === 'thumbnail') {
      expect(image.src).toContain('-thumb');
      expect(image.srcSet).toBeNull();
      expect(image.sizes).toBeNull();
    }
  }

  await expect(
    page.locator('#about img[data-media-variant="responsive"]'),
  ).toHaveAttribute('fetchpriority', 'auto');
  await expect(
    page
      .getByTestId('journey-sticky-stage')
      .locator('img[data-media-variant="responsive"]'),
  ).toHaveAttribute('fetchpriority', 'low');
  const workPriorities = await page
    .locator('#works img[data-media-variant="responsive"]')
    .evaluateAll((images) =>
      images.map((image) => image.getAttribute('fetchpriority')),
    );
  expect(workPriorities).toHaveLength(5);
  expect(workPriorities.every((priority) => priority === 'auto')).toBe(true);
  await expect(
    page.locator('#visuals img[data-media-variant="responsive"]'),
  ).toHaveAttribute('fetchpriority', 'auto');
});

test('background artwork warmup completes in reading order without requiring scroll', async ({
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  if (typeof baseURL !== 'string') {
    throw new Error('Playwright baseURL required');
  }

  const context = await browser.newContext({
    baseURL,
    deviceScaleFactor: 3,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('main').waitFor();
  await page.waitForFunction(
    () =>
      performance.getEntriesByName('kafu-artwork-warmup-complete').length > 0,
    undefined,
    { timeout: 20_000 },
  );

  const audit = await page.evaluate(
    (sourceIds) => {
      const entries = performance
        .getEntriesByType('resource')
        .map((entry) => entry.toJSON())
        .filter((entry) => {
          const url = new URL(String(entry.name));
          return (
            url.origin === location.origin &&
            /\/assets\/.*\.webp$/.test(url.pathname)
          );
        })
        .sort((first, second) => first.startTime - second.startTime)
        .map((entry) => {
          const filename =
            new URL(String(entry.name)).pathname.split('/').pop() ?? '';
          const sourceId = sourceIds.find((id) =>
            filename.startsWith(`${id}-`),
          );

          return {
            filename,
            sourceId: sourceId ?? '',
            startTime: Math.round(entry.startTime),
            transferSize: entry.transferSize || 0,
          };
        });

      return {
        scrollY: window.scrollY,
        entries,
        warmupStartMarks: performance.getEntriesByName(
          'kafu-artwork-warmup-start',
        ).length,
        warmupCompleteMarks: performance.getEntriesByName(
          'kafu-artwork-warmup-complete',
        ).length,
      };
    },
    [
      'fable-chewing-disco',
      'observation-past',
      'transcendent-ufo',
      'wasurete-shimae',
      'kyousou-beta',
      'magic-keshiki',
      'tori-portrait',
      'origin-ito',
      'fukakai',
      'kaihou',
    ],
  );

  expect(audit.scrollY).toBe(0);
  expect(audit.warmupStartMarks).toBe(1);
  expect(audit.warmupCompleteMarks).toBe(1);

  const responsiveRequestOrder = audit.entries
    .filter(
      (entry) => entry.sourceId !== '' && !entry.filename.includes('-thumb-'),
    )
    .map((entry) => entry.sourceId)
    .filter((sourceId, index, values) => values.indexOf(sourceId) === index);
  expect(responsiveRequestOrder).toEqual([
    'kaihou',
    'wasurete-shimae',
    'origin-ito',
    'observation-past',
    'magic-keshiki',
    'fable-chewing-disco',
    'transcendent-ufo',
    'kyousou-beta',
    'tori-portrait',
    'fukakai',
  ]);

  const thumbnailRequests = new Set(
    audit.entries
      .filter(
        (entry) => entry.sourceId !== '' && entry.filename.includes('-thumb-'),
      )
      .map((entry) => entry.sourceId),
  );
  expect(thumbnailRequests).toEqual(
    new Set([
      'tori-portrait',
      'wasurete-shimae',
      'fukakai',
      'origin-ito',
      'observation-past',
      'magic-keshiki',
      'fable-chewing-disco',
      'transcendent-ufo',
    ]),
  );
  expect(audit.entries.every((entry) => entry.transferSize >= 0)).toBe(true);

  await scrollToCenter(page, '#works');
  await expect(
    page.locator('#works [data-artwork-status="loaded"]'),
  ).toHaveCount(5, { timeout: 2_000 });
  await scrollToCenter(page, '#visuals');
  await expect(
    page.locator('#visuals [data-artwork-variant="responsive"]'),
  ).toHaveAttribute('data-artwork-status', 'loaded', { timeout: 2_000 });

  await context.close();
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
