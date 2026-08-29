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

const chapterAnchors = [
  '#journey-origin-2018',
  '#journey-observation-2019',
  '#journey-magic-rebuilding-2020-2021',
  '#journey-expansion-2022-2023',
  '#journey-fable-2024',
  '#journey-transcendent-love-2025-2026',
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
        'main h1, main h2, main h3, main p, main a, main figcaption, main time, footer p, footer a, footer summary',
      ),
    );

    return elements
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
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

test('desktop homepage is Chinese-first, localized, and free of legacy UI chrome', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: '花谱' }),
  ).toBeInViewport();
  await expect(
    page.locator('#top').getByRole('img', { name: /粉色短发的花谱/ }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: /开始认识花谱/ }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: /查看成长轨迹/ }),
  ).toBeInViewport();

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeAttached();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page).toHaveTitle('花谱观察站｜认识花谱 KAF');

  const expectedHeadings = [
    '认识花谱',
    '成长轨迹',
    '代表作品',
    '视觉档案',
    '官方入口',
  ] as const;

  for (const heading of expectedHeadings) {
    await expect(
      page.getByRole('heading', { level: 2, name: heading }),
    ).toBeAttached();
  }

  const navigation = page.getByRole('navigation', {
    name: '花谱观察站页面导航',
  });
  const expectedTargets = [
    ['认识花谱', '#about'],
    ['成长轨迹', '#journey'],
    ['代表作品', '#works'],
    ['视觉档案', '#visuals'],
    ['官方入口', '#links'],
  ] as const;

  for (const [label, href] of expectedTargets) {
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  }

  const legacyUiStrings = [
    '軌跡',
    '視覚',
    '公式サイト',
    '軌跡を見る',
    '新しいタブで開く',
    '画像を選ぶ',
    '画像出典（9件）',
    'VOICE / IMAGE / MEMORY',
    'KAF / CHRONOLOGY',
    'CURRENT WORK',
    'VISUAL CREDIT',
  ];

  for (const copy of legacyUiStrings) {
    await expect(page.locator('body')).not.toContainText(copy);
  }

  await expect(page.locator('[class*="eyebrow"]')).toHaveCount(0);
  await expect(page.locator('[data-rhythm]')).toHaveCount(0);
  await expect(
    page
      .getByRole('contentinfo')
      .getByText('图片作者与制作：花譜 / PALOW. / 川サキケンジ / とり'),
  ).toBeVisible();
  await expect(page.locator('#media-sources summary')).toContainText(
    '图片来源（9 项）',
  );
  await expect(
    page.getByRole('contentinfo').getByText('资料来源（4 项）'),
  ).toBeAttached();

  const hierarchy = await page.evaluate(() => {
    const readFontSize = (selector: string) => {
      const element = document.querySelector(selector);

      if (!element) {
        throw new Error(`Missing visual hierarchy target: ${selector}`);
      }

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
      documentHeight: document.documentElement.scrollHeight,
      navFontSize: readFontSize('header nav a'),
      sectionHeadingSizes: [
        '#about h2',
        '#journey h2',
        '#works h2',
        '#visuals h2',
      ].map(readFontSize),
      smallVisibleText,
    };
  });

  expect(hierarchy.bodyFontSize).toBeGreaterThanOrEqual(16);
  expect(hierarchy.navFontSize).toBeGreaterThanOrEqual(14);
  expect(Math.max(...hierarchy.sectionHeadingSizes)).toBeLessThanOrEqual(72);
  expect(hierarchy.documentHeight).toBeLessThan(18_000);
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

      if (!channels || channels.length < 3) {
        throw new Error(`Unable to parse color: ${value}`);
      }

      return [
        channels[0] ?? 0,
        channels[1] ?? 0,
        channels[2] ?? 0,
        channels[3] ?? 1,
      ];
    }

    function compositeOverWhite(value: string): [number, number, number] {
      const [red, green, blue, alpha] = parse(value);
      return [
        red * alpha + 255 * (1 - alpha),
        green * alpha + 255 * (1 - alpha),
        blue * alpha + 255 * (1 - alpha),
      ];
    }

    function luminance(channels: [number, number, number]) {
      const linear = channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
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

    if (!headerElement || !navLink || !primaryAction) {
      throw new Error('Missing contrast target.');
    }

    const headerStyle = getComputedStyle(headerElement);
    const navStyle = getComputedStyle(navLink);
    const actionStyle = getComputedStyle(primaryAction);

    return {
      navOnPaleArtwork: ratio(
        compositeOverWhite(navStyle.color),
        compositeOverWhite(headerStyle.backgroundColor),
      ),
      primaryAction: ratio(
        compositeOverWhite(actionStyle.color),
        compositeOverWhite(actionStyle.backgroundColor),
      ),
    };
  });

  expect(contrast.navOnPaleArtwork).toBeGreaterThanOrEqual(4.5);
  expect(contrast.primaryAction).toBeGreaterThanOrEqual(4.5);

  const navigation = page.getByRole('navigation', {
    name: '花谱观察站页面导航',
  });
  const locations = [
    ['#about', '认识花谱'],
    ['#journey', '成长轨迹'],
    ['#works', '代表作品'],
    ['#visuals', '视觉档案'],
    ['#links', '官方入口'],
  ] as const;

  for (const [selector, label] of locations) {
    await scrollToCenter(page, selector);
    const link = navigation.getByRole('link', { name: label });
    await expect(link).toHaveAttribute('aria-current', 'location');
    await expect(link).toHaveAttribute('data-active', 'true');
  }

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole('navigation', { name: '花谱观察站页面导航' })
    .getByRole('link', { name: '代表作品' })
    .click();
  await expect(
    page.getByRole('heading', { level: 2, name: '代表作品' }),
  ).toBeInViewport();
  await expectAnchorBelowHeader(page, '代表作品');
});

test('hero selects density-matched generated artwork at DPR 1 and DPR 2', async ({
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;

  if (typeof baseURL !== 'string') {
    throw new Error('Playwright baseURL is required for density tests.');
  }

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
        height: image.getAttribute('height'),
        src: image.getAttribute('src'),
        srcSet: image.getAttribute('srcset'),
        width: image.getAttribute('width'),
      };
    });

    expect(source.src).toContain('kaihou-2x');
    expect(source.srcSet).toContain('kaihou-2x');
    expect(source.srcSet).toContain('kaihou-4x');
    expect(source.width).toBe('1720');
    expect(source.height).toBe('968');
    expect(source.currentSrc).toContain(
      density === 1 ? 'kaihou-2x' : 'kaihou-4x',
    );

    await context.close();
  }
});

test('newcomer story advances through four meaningful beats and releases its stage', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const section = page.locator('#about');
  const stage = page.getByTestId('primer-sticky-stage');
  const steps = section.locator('article[data-primer-index]');

  await expect(steps).toHaveCount(4);
  await expect(stage).toBeVisible();
  await expect(stage).toHaveCSS('position', 'sticky');

  const expectedStates = [
    ['0', '她是谁', '一个从网络深处被发现的声音。'],
    ['2', '她走到了哪里', '从屏幕里的歌，走进现实的大型舞台。'],
    ['3', '从哪里开始', '先听起点，再看现场，最后进入第二章。'],
  ] as const;

  for (const [index, title, statement] of expectedStates) {
    const step = section.locator(`article[data-primer-index="${index}"]`);
    await scrollToCenter(page, `#about article[data-primer-index="${index}"]`);
    await expect(step).toHaveAttribute('data-active', 'true');
    await expect(stage.getByText(title, { exact: true })).toBeVisible();
    await expect(stage.getByText(statement, { exact: true })).toBeVisible();
  }

  await scrollToCenter(page, chapterAnchors[0]);
  await expect(stage).not.toBeInViewport();
});

test('journey advances through six Chinese narratives and transformation pairs', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const stage = page.getByTestId('journey-sticky-stage');
  await scrollToCenter(page, chapterAnchors[0]);
  await expect(stage).toBeVisible();
  await expect(stage).toHaveCSS('position', 'sticky');
  await expect(page.locator(chapterAnchors[0])).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(stage.getByText('被发现的声音', { exact: true })).toBeVisible();
  await expect(stage.getByText('网络中的投稿', { exact: true })).toBeVisible();
  await expect(stage.getByText('第一次被看见', { exact: true })).toBeVisible();

  await scrollToCenter(page, chapterAnchors[2]);
  await expect(page.locator(chapterAnchors[2])).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(
    stage.getByText('在无法相聚时重构舞台', { exact: true }),
  ).toBeVisible();
  await expect(stage.getByText('魔法 / 再構築', { exact: true })).toBeVisible();
  await expect(
    stage.getByText('无法按计划相聚', { exact: true }),
  ).toBeVisible();
  await expect(
    stage.getByText('线上现场与重返会场', { exact: true }),
  ).toBeVisible();

  await scrollToCenter(page, chapterAnchors[5]);
  await expect(page.locator(chapterAnchors[5])).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(
    stage.getByText('走向更大的世界', { exact: true }),
  ).toBeVisible();
  await expect(
    stage.getByText('日本国内的成长', { exact: true }),
  ).toBeVisible();
  await expect(
    stage.getByText('海外活动与新的当下', { exact: true }),
  ).toBeVisible();

  await page
    .locator('#works article')
    .first()
    .evaluate((element) => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
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
  await expect(
    thumbnailList.getByRole('button', { name: '花譜ちゃん，显示此图' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    gallery.getByRole('button', { name: '花譜ちゃん，点击放大' }),
  ).toBeVisible();

  await thumbnailList.getByRole('button', { name: '不可解，显示此图' }).click();
  await expect(
    thumbnailList.getByRole('button', { name: '不可解，显示此图' }),
  ).toHaveAttribute('aria-pressed', 'true');
  const activeStage = gallery.getByRole('button', { name: '不可解，点击放大' });
  await expect(activeStage).toBeVisible();

  await activeStage.click();
  const closeButton = page.getByRole('button', { name: '关闭' });
  await expect(closeButton).toBeVisible();
  await expect(page.getByRole('button', { name: '上一张图片' })).toBeVisible();
  await expect(page.getByRole('button', { name: '下一张图片' })).toBeVisible();
  const lightboxImage = page.locator('.yarl__slide_image[alt^="黑色舞台上"]');
  await expect(lightboxImage).toHaveAttribute('src', /fukakai-4x/);

  await page.keyboard.press('ArrowRight');
  await expect(
    page.locator('#visuals button[aria-label="糸，显示此图"]'),
  ).toHaveAttribute('aria-pressed', 'true');

  const zoomIn = page.getByRole('button', { name: '放大' });
  await expect(zoomIn).toBeVisible();
  await zoomIn.click();
  await expect(page.getByRole('button', { name: '缩小' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(closeButton).toHaveCount(0);
  await expect(
    gallery.getByRole('button', { name: '糸，点击放大' }),
  ).toBeVisible();
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

test('mobile homepage keeps onboarding and journey linear with touch-safe controls', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花谱' }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: /开始认识花谱/ }),
  ).toBeInViewport();
  await expectNoHorizontalOverflow(page, '390×844 hero');

  await expect(page.getByTestId('primer-sticky-stage')).toBeHidden();
  await expect(page.locator('#about article[data-primer-index]')).toHaveCount(
    4,
  );
  await expect(page.getByTestId('journey-sticky-stage')).toBeHidden();
  await expect(
    page.locator('#journey article[data-journey-index]'),
  ).toHaveCount(6);

  const navTargets = page
    .getByRole('navigation', { name: '花谱观察站页面导航' })
    .getByRole('link');
  await expect(navTargets).toHaveCount(5);

  for (let index = 0; index < (await navTargets.count()); index += 1) {
    const box = await navTargets.nth(index).boundingBox();
    expect(box, `mobile nav target ${index + 1}`).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await scrollToCenter(page, '#visuals');
  const mobileGalleryLabels = await page
    .locator('#visuals')
    .getByRole('list', { name: '选择图片' })
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    );
  expect(mobileGalleryLabels).toEqual(
    galleryTitles.map((title) => `${title}，显示此图`),
  );
  await expectNoHorizontalOverflow(page, '390×844 gallery');
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

    const shouldUseStickyStage =
      viewport.width >= 1024 && viewport.height >= 736;
    const primerStage = page.getByTestId('primer-sticky-stage');
    const journeyStage = page.getByTestId('journey-sticky-stage');

    if (shouldUseStickyStage) {
      await expect(primerStage).toBeVisible();
      await expect(journeyStage).toBeVisible();
    } else {
      await expect(primerStage).toBeHidden();
      await expect(journeyStage).toBeHidden();
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

test('large user text preferences preserve essential reflow', async ({
  page,
}) => {
  await openHome(page, { width: 640, height: 900 });
  await page.addStyleTag({
    content: ':root { font-size: 200% !important; }',
  });

  await expectNoHorizontalOverflow(page, '640×900 with 200% root text');
  await expectNoEssentialHorizontalClipping(
    page,
    '640×900 with 200% root text essential content',
  );

  for (const selector of pageSections) {
    await scrollToCenter(page, selector);
    await expectNoHorizontalOverflow(
      page,
      `640×900 with 200% root text ${selector}`,
    );
  }
});

test('reduced motion renders all narrative content without sticky stages', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page, { width: 1440, height: 900 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花谱' }),
  ).toBeVisible();
  await expect(page.getByTestId('primer-sticky-stage')).toHaveCount(0);
  await expect(page.getByTestId('journey-sticky-stage')).toHaveCount(0);
  await expect(page.locator('#about article[data-primer-index]')).toHaveCount(
    4,
  );
  await expect(
    page.locator('#journey article[data-journey-index]'),
  ).toHaveCount(6);
  await expect(
    page
      .locator('#visuals')
      .getByRole('list', { name: '选择图片' })
      .getByRole('button'),
  ).toHaveCount(8);

  for (const chapterAnchor of chapterAnchors) {
    await scrollToCenter(page, chapterAnchor);
    await expect(page.locator(chapterAnchor)).toBeInViewport();
  }

  const heroMotionState = await page.locator('#top h1').evaluate((element) => {
    const animatedParent = element.parentElement;

    if (!animatedParent) {
      return null;
    }

    const style = getComputedStyle(animatedParent);
    return { opacity: style.opacity, transform: style.transform };
  });

  expect(heroMotionState).toEqual({ opacity: '1', transform: 'none' });
  await expectNoHorizontalOverflow(page, '1440×900 reduced motion');
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
  const uniqueSources = new Set(imageLoading.map((image) => image.src));
  const eagerImages = imageLoading.filter((image) => image.loading === 'eager');

  expect(uniqueSources.size).toBeGreaterThanOrEqual(9);
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

test('captures the Chinese storytelling visual evidence', async ({ page }) => {
  const evidenceDirectory = 'test-results/kaf-round4-cn-storytelling';

  await openHome(page, { width: 1440, height: 900 });
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-hero-header.png`,
  });

  await scrollToCenter(page, '#about article[data-primer-index="0"]');
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-about-identity.png`,
  });

  await scrollToCenter(page, '#about article[data-primer-index="2"]');
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-about-stage.png`,
  });

  await scrollToCenter(page, chapterAnchors[3]);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-journey-expansion.png`,
  });

  await scrollToCenter(page, '#visuals-title');
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-gallery.png`,
  });

  await openHome(page, { width: 390, height: 844 });
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-hero-header.png`,
  });

  await scrollToCenter(page, '#about');
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-about.png`,
  });
});
