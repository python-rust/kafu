import { expect, test, type Page } from '@playwright/test';

const targetViewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
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

const eraLabels = [
  '2018：被发现的声音',
  '2019：从网络走向现场',
  '2020–2021：在无法相聚时重构舞台',
  '2022–2023：把虚拟歌声带进武道馆',
  '2024：进入创作的第二章',
  '2025–2026：走向更大的世界',
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
          element.closest(
            'header nav, #journey [role="tablist"], #visuals [aria-label="选择图片"]',
          ),
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
  await expect(journey.getByRole('tab')).toHaveCount(6);
  await expect(journey.getByRole('tabpanel')).toHaveCount(1);
  await expect(
    journey.getByRole('heading', { level: 3, name: '被发现的声音' }),
  ).toBeVisible();
  await expect(
    journey.locator('[data-testid="journey-sticky-stage"]'),
  ).toHaveCount(0);

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
    const hero = page.locator('#top img[data-media-id="kaihou"]');
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

test('journey exposes six keyboard-complete era tabs and previous/next controls', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });
  await scrollToCenter(page, '#journey');

  const journey = page.locator('#journey');
  const tabList = journey.getByRole('tablist', { name: '花谱成长阶段' });
  const tabs = tabList.getByRole('tab');
  await expect(tabs).toHaveCount(6);
  await expect(
    tabs.evaluateAll((items) =>
      items.map((item) => item.getAttribute('aria-label')),
    ),
  ).resolves.toEqual(eraLabels);

  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(
    journey.getByRole('heading', { level: 3, name: '从网络走向现场' }),
  ).toBeVisible();

  await page.keyboard.press('End');
  await expect(tabs.nth(5)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');

  await tabs.nth(2).click();
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  const panel = journey.getByRole('tabpanel');
  await expect(
    panel.getByRole('heading', { level: 3, name: '在无法相聚时重构舞台' }),
  ).toBeVisible();
  await expect(panel).toContainText('2020 年，受现场条件影响');
  await expect(panel.getByRole('img')).toHaveCount(2);

  const selectedControls = await tabs.nth(2).getAttribute('aria-controls');
  expect(selectedControls).not.toBeNull();
  await expect(page.locator(`[id="${selectedControls}"]`)).toHaveCount(1);

  await panel
    .getByRole('button', { name: '下一阶段：把虚拟歌声带进武道馆' })
    .click();
  await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
  await expect(
    journey.getByRole('heading', { level: 3, name: '把虚拟歌声带进武道馆' }),
  ).toBeVisible();
  await journey
    .getByRole('button', { name: '上一阶段：在无法相聚时重构舞台' })
    .click();
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');

  await expect(journey).not.toContainText('网络中的投稿');
  await expect(journey).not.toContainText('第一次被看见');
  await expect(
    journey.locator('[data-testid="journey-sticky-stage"]'),
  ).toHaveCount(0);
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

test('mobile profile and era theatre remain linear, contained, and touch-safe', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花谱' }),
  ).toBeInViewport();
  await expect(page.getByRole('link', { name: '人物介绍' })).toBeInViewport();
  await expectNoHorizontalOverflow(page, '390×844 hero');

  await expect(
    page.locator('#about [data-testid="primer-sticky-stage"]'),
  ).toHaveCount(0);
  await expect(page.locator('#about dl')).toBeAttached();

  const tabs = page.locator('#journey').getByRole('tab');
  await expect(tabs).toHaveCount(6);
  const railMetrics = await page
    .locator('#journey')
    .getByRole('tablist')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        left: rect.left,
        right: rect.right,
        viewport: window.innerWidth,
      };
    });
  expect(railMetrics.scrollWidth).toBeGreaterThan(railMetrics.clientWidth);
  expect(railMetrics.left).toBeGreaterThanOrEqual(-1);
  expect(railMetrics.right).toBeLessThanOrEqual(railMetrics.viewport + 1);

  for (let index = 0; index < (await tabs.count()); index += 1) {
    const box = await tabs.nth(index).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await tabs.nth(4).click();
  await expect(tabs.nth(4)).toHaveAttribute('aria-selected', 'true');
  await expect(
    page.locator('#journey').getByRole('heading', {
      level: 3,
      name: '进入创作的第二章',
    }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page, '390×844 journey');
});

test('all target viewport sizes remain free of horizontal overflow', async ({
  page,
}) => {
  for (const viewport of targetViewports) {
    await openHome(page, viewport);
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
    await expect(
      page.locator('[data-testid="journey-sticky-stage"]'),
    ).toHaveCount(0);

    for (const selector of pageSections) {
      await scrollToCenter(page, selector);
      await expectNoHorizontalOverflow(
        page,
        `${viewport.width}×${viewport.height} ${selector}`,
      );
    }
  }
});

test('large user text preferences preserve essential reflow and era controls', async ({
  page,
}) => {
  await openHome(page, { width: 640, height: 900 });
  await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });

  await expectNoHorizontalOverflow(page, '640×900 with 200% root text');
  await expectNoEssentialHorizontalClipping(
    page,
    '640×900 with 200% root text essential content',
  );
  await expect(page.locator('#journey').getByRole('tab')).toHaveCount(6);

  for (const selector of pageSections) {
    await scrollToCenter(page, selector);
    await expectNoHorizontalOverflow(
      page,
      `640×900 with 200% root text ${selector}`,
    );
  }
});

test('reduced motion preserves profile, tabs, and active-panel controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page, { width: 1440, height: 900 });

  await expect(page.locator('#about dl')).toBeVisible();
  await expect(page.locator('#journey').getByRole('tab')).toHaveCount(6);
  await page.locator('#journey').getByRole('tab').nth(5).click();
  await expect(
    page.locator('#journey').getByRole('heading', {
      level: 3,
      name: '走向更大的世界',
    }),
  ).toBeVisible();

  const panelMotion = await page
    .getByTestId('journey-era-panel')
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return { opacity: style.opacity, transform: style.transform };
    });
  expect(panelMotion).toEqual({ opacity: '1', transform: 'none' });

  const heroMotionState = await page.locator('#top h1').evaluate((element) => {
    const animatedParent = element.parentElement;
    if (!animatedParent) return null;
    const style = getComputedStyle(animatedParent);
    return { opacity: style.opacity, transform: style.transform };
  });
  expect(heroMotionState).toEqual({ opacity: '1', transform: 'none' });
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

test('captures the editorial profile and era-theatre visual evidence', async ({
  page,
}) => {
  const evidenceDirectory = 'test-results/kaf-round5-editorial-era-theatre';

  await openHome(page, { width: 1440, height: 900 });
  await page.screenshot({ path: `${evidenceDirectory}/1440x900-hero.png` });

  await scrollToCenter(page, '#about');
  await page.screenshot({ path: `${evidenceDirectory}/1440x900-profile.png` });

  await scrollToCenter(page, '#journey');
  await page.locator('#journey').getByRole('tab').nth(3).click();
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-era-theatre.png`,
  });

  await scrollToCenter(page, '#works');
  await page.screenshot({ path: `${evidenceDirectory}/1440x900-works.png` });

  await openHome(page, { width: 390, height: 844 });
  await page.screenshot({ path: `${evidenceDirectory}/390x844-hero.png` });
  await scrollToCenter(page, '#journey');
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-era-theatre.png`,
  });
});
