import { expect, test, type Page } from '@playwright/test';

const targetViewports = [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
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
        'main h1, main h2, main h3, main p, main a, main figcaption, main time, footer p, footer a',
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

test('desktop homepage uses direct Japanese structure and rejects template copy', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: '花譜' }),
  ).toBeInViewport();
  await expect(
    page
      .locator('#top')
      .getByRole('img', { name: /粉色短发の花譜|粉色短发的花譜/ }),
  ).toBeInViewport();
  await expect(page.getByRole('link', { name: /公式サイト/ })).toBeInViewport();
  await expect(page.getByRole('link', { name: /軌跡を見る/ })).toBeInViewport();

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeAttached();
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    'content',
    '#0d0910',
  );

  const visualSystemContract = await page.evaluate(() => {
    const readFontSize = (selector: string) => {
      const element = document.querySelector(selector);

      if (!element) {
        throw new Error(`Missing visual-system contract target: ${selector}`);
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
      navFontSize: readFontSize('header nav a'),
      sectionHeadingSizes: ['#journey h2', '#works h2', '#visuals h2'].map(
        readFontSize,
      ),
      documentHeight: document.documentElement.scrollHeight,
      smallVisibleText,
    };
  });

  expect(visualSystemContract.bodyFontSize).toBeGreaterThanOrEqual(16);
  expect(visualSystemContract.navFontSize).toBeGreaterThanOrEqual(14);
  expect(
    Math.max(...visualSystemContract.sectionHeadingSizes),
  ).toBeLessThanOrEqual(72);
  expect(visualSystemContract.documentHeight).toBeLessThan(14_000);
  expect(visualSystemContract.smallVisibleText).toEqual([]);

  const navigation = page.getByRole('navigation', {
    name: '花譜サイト内ナビゲーション',
  });
  const expectedTargets = [
    ['軌跡', '#journey'],
    ['作品', '#works'],
    ['視覚', '#visuals'],
    ['公式', '#links'],
  ] as const;

  for (const [label, href] of expectedTargets) {
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  }

  const bannedCopy = [
    'VOICE / IMAGE / MEMORY',
    'KAF / CHRONOLOGY',
    'KAF / SELECTED DISCOGRAPHY',
    'KAF / VISUAL NOTES',
    'KAF / OFFICIAL CHANNELS',
    'CURRENT WORK',
    'VISUAL CREDIT',
    '沿着时间向下阅读花譜的六个创作阶段',
    '不同阶段的服装、舞台与色彩被放回同一条视觉脉络中',
  ];

  for (const copy of bannedCopy) {
    await expect(page.locator('body')).not.toContainText(copy);
  }
  await expect(page.locator('[class*="eyebrow"]')).toHaveCount(0);
  await expect(page.locator('[data-rhythm]')).toHaveCount(0);
  await expect(
    page
      .getByRole('contentinfo')
      .getByText('画像：花譜 / PALOW. / 川サキケンジ / とり'),
  ).toBeVisible();
  await expect(page.locator('#media-sources summary')).toContainText(
    '画像出典（9件）',
  );
  await expect(
    page.getByRole('main').locator('a[href^="https://piapro.jp/t/"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('#media-sources a[href^="https://piapro.jp/t/"]'),
  ).toHaveCount(9);

  await navigation.getByRole('link', { name: '軌跡' }).click();
  await expect(
    page.getByRole('heading', { level: 2, name: '軌跡' }),
  ).toBeInViewport();

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole('navigation', { name: '花譜サイト内ナビゲーション' })
    .getByRole('link', { name: '作品' })
    .click();
  await expect(
    page.getByRole('heading', { level: 2, name: '作品' }),
  ).toBeInViewport();

  await page.keyboard.press('Home');
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
  const focusStyle = await focusedElement.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
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
        src: image.getAttribute('src'),
        srcSet: image.getAttribute('srcset'),
        width: image.getAttribute('width'),
        height: image.getAttribute('height'),
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

test('dark-system text roles and the primary hero action retain readable contrast', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const contrast = await page.evaluate(() => {
    function parseColor(value: string): [number, number, number] {
      const probe = document.createElement('span');
      probe.style.color = value;
      document.body.append(probe);

      const normalized = getComputedStyle(probe).color;
      probe.remove();

      const channels = normalized
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number);

      if (!channels || channels.length !== 3) {
        throw new Error(`Unable to parse CSS color: ${value}`);
      }

      return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
    }

    function relativeLuminance(value: string) {
      const [red, green, blue] = parseColor(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      }) as [number, number, number];

      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function ratio(foreground: string, background: string) {
      const foregroundLuminance = relativeLuminance(foreground);
      const backgroundLuminance = relativeLuminance(background);
      const lighter = Math.max(foregroundLuminance, backgroundLuminance);
      const darker = Math.min(foregroundLuminance, backgroundLuminance);

      return (lighter + 0.05) / (darker + 0.05);
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const background = rootStyle.getPropertyValue('--color-bg').trim();
    const softBackground = rootStyle.getPropertyValue('--color-bg-soft').trim();
    const mutedText = rootStyle.getPropertyValue('--color-text-muted').trim();
    const faintText = rootStyle.getPropertyValue('--color-text-faint').trim();
    const blueText = rootStyle.getPropertyValue('--color-blue-light').trim();
    const heroAction = document.querySelector<HTMLElement>(
      '#top a[href="https://kaf.kamitsubaki.jp/"]',
    );

    if (!heroAction) {
      throw new Error('Primary hero action was not found.');
    }

    const actionStyle = getComputedStyle(heroAction);

    return {
      mutedOnBackground: ratio(mutedText, background),
      faintOnSoftBackground: ratio(faintText, softBackground),
      blueOnSoftBackground: ratio(blueText, softBackground),
      heroAction: ratio(actionStyle.color, actionStyle.backgroundColor),
    };
  });

  expect(contrast.mutedOnBackground).toBeGreaterThanOrEqual(4.5);
  expect(contrast.faintOnSoftBackground).toBeGreaterThanOrEqual(4.5);
  expect(contrast.blueOnSoftBackground).toBeGreaterThanOrEqual(4.5);
  expect(contrast.heroAction).toBeGreaterThanOrEqual(4.5);
});

test('desktop journey advances through real chapters and releases the sticky stage', async ({
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
  await expect(stage.getByText('2018', { exact: true })).toBeVisible();

  await scrollToCenter(page, chapterAnchors[2]);
  await expect(page.locator(chapterAnchors[2])).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(stage.getByText('2020–2021', { exact: true })).toBeVisible();
  await expect(stage.getByText('魔法 / 再構築', { exact: true })).toBeVisible();

  await scrollToCenter(page, chapterAnchors[5]);
  await expect(page.locator(chapterAnchors[5])).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(stage.getByText('2025–2026', { exact: true })).toBeVisible();

  await scrollToCenter(page, '#works-title');
  await expect(
    page.getByRole('heading', { level: 2, name: '作品' }),
  ).toBeInViewport();
  await page
    .locator('#works article')
    .first()
    .evaluate((element) => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  await expect(stage).not.toBeInViewport();
});

test('gallery provides one focal stage, eight selectors, and keyboard lightbox navigation', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });
  await scrollToCenter(page, '#visuals-title');

  const gallery = page.locator('#visuals');
  const thumbnailList = gallery.getByRole('list', { name: '画像を選ぶ' });
  const thumbnailButtons = thumbnailList.getByRole('button');

  await expect(thumbnailButtons).toHaveCount(8);
  await expect(
    thumbnailButtons.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    ),
  ).resolves.toEqual(galleryTitles.map((title) => `${title}を表示`));
  await expect(
    thumbnailList.getByRole('button', { name: '花譜ちゃんを表示' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    gallery.getByRole('button', { name: '花譜ちゃんを拡大表示' }),
  ).toBeVisible();

  await thumbnailList.getByRole('button', { name: '不可解を表示' }).click();
  await expect(
    thumbnailList.getByRole('button', { name: '不可解を表示' }),
  ).toHaveAttribute('aria-pressed', 'true');
  const activeStage = gallery.getByRole('button', { name: '不可解を拡大表示' });
  await expect(activeStage).toBeVisible();
  await expect(
    gallery.getByRole('heading', { level: 3, name: '不可解' }),
  ).toBeVisible();

  await activeStage.click();
  const closeButton = page.getByRole('button', { name: '閉じる' });
  await expect(closeButton).toBeVisible();
  await expect(page.getByRole('button', { name: '前の画像' })).toBeVisible();
  await expect(page.getByRole('button', { name: '次の画像' })).toBeVisible();
  const lightboxImage = page.locator('.yarl__slide_image[alt^="黑色舞台上"]');
  await expect(lightboxImage).toHaveAttribute('src', /fukakai-4x/);

  await page.keyboard.press('ArrowRight');
  await expect(
    page.locator('#visuals button[aria-label="糸を表示"]'),
  ).toHaveAttribute('aria-pressed', 'true');

  const zoomIn = page.getByRole('button', { name: '拡大' });
  await expect(zoomIn).toBeVisible();
  await zoomIn.click();
  const zoomOut = page.getByRole('button', { name: '縮小' });
  await expect(zoomOut).toBeVisible();
  await zoomOut.click();
  await expect(page.getByRole('button', { name: '拡大' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(closeButton).toHaveCount(0);
  await expect(
    gallery.getByRole('button', { name: '糸を拡大表示' }),
  ).toBeVisible();
});

test('gallery reserves generated thumbnails for the rail and atmospheric backdrop', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });
  await scrollToCenter(page, '#visuals-title');

  const gallery = page.locator('#visuals');
  const thumbnailImages = gallery
    .getByRole('list', { name: '画像を選ぶ' })
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

test('mobile homepage keeps the journey linear and gallery selectors source-ordered', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花譜' }),
  ).toBeInViewport();
  await expect(page.getByRole('link', { name: /公式サイト/ })).toBeInViewport();
  await expect(page.getByRole('link', { name: /軌跡を見る/ })).toBeInViewport();
  await expectNoHorizontalOverflow(page, '390×844 hero');

  const stage = page.getByTestId('journey-sticky-stage');
  await expect(stage).toBeHidden();

  const chapterArticles = page.locator('#journey article[data-journey-index]');
  await expect(chapterArticles).toHaveCount(6);

  for (const chapterAnchor of chapterAnchors) {
    await expect(page.locator(chapterAnchor)).toBeAttached();
  }

  const navTargets = page
    .getByRole('navigation', { name: '花譜サイト内ナビゲーション' })
    .getByRole('link');
  const navTargetCount = await navTargets.count();

  for (let index = 0; index < navTargetCount; index += 1) {
    const box = await navTargets.nth(index).boundingBox();
    expect(box, `mobile nav target ${index + 1}`).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await scrollToCenter(page, '#visuals');
  const mobileGalleryLabels = await page
    .locator('#visuals')
    .getByRole('list', { name: '画像を選ぶ' })
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    );
  expect(mobileGalleryLabels).toEqual(
    galleryTitles.map((title) => `${title}を表示`),
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

    const stage = page.getByTestId('journey-sticky-stage');
    const shouldUseStickyStage =
      viewport.width >= 1024 && viewport.height >= 736;

    if (shouldUseStickyStage) {
      await expect(stage).toBeVisible();
      await expect(stage).toHaveCSS('position', 'sticky');
    } else {
      await expect(stage).toBeHidden();
    }

    if (viewport.width <= 390) {
      const navTargets = page
        .getByRole('navigation', { name: '花譜サイト内ナビゲーション' })
        .getByRole('link');
      const navTargetCount = await navTargets.count();

      for (let index = 0; index < navTargetCount; index += 1) {
        const box = await navTargets.nth(index).boundingBox();
        expect(
          box,
          `${viewport.width}px nav target ${index + 1}`,
        ).not.toBeNull();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    }

    for (const selector of ['#journey', '#works', '#visuals', '#links']) {
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

  for (const selector of ['#journey', '#works', '#visuals', '#links']) {
    await scrollToCenter(page, selector);
    await expectNoHorizontalOverflow(
      page,
      `640×900 with 200% root text ${selector}`,
    );
  }
});

test('reduced motion renders all content without the desktop sticky stage', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page, { width: 1440, height: 900 });

  await expect(
    page.getByRole('heading', { level: 1, name: '花譜' }),
  ).toBeVisible();
  await expect(page.getByTestId('journey-sticky-stage')).toHaveCount(0);
  await expect(
    page.locator('#journey article[data-journey-index]'),
  ).toHaveCount(6);
  await expect(
    page
      .locator('#visuals')
      .getByRole('list', { name: '画像を選ぶ' })
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

test('only the hero image is eager and responsive/thumbnail candidates remain explicit', async ({
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

test('captures the responsive-media visual evidence', async ({ page }) => {
  const evidenceDirectory = 'test-results/kaf-round3-visual-evidence';

  await openHome(page, { width: 1440, height: 900 });
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-hero.png`,
  });

  await scrollToCenter(page, chapterAnchors[2]);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-journey.png`,
  });

  await scrollToCenter(page, '#works-title');
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-works.png`,
  });

  await scrollToCenter(page, '#visuals-title');
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-gallery.png`,
  });

  await openHome(page, { width: 390, height: 844 });
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-hero.png`,
  });

  await scrollToCenter(page, '#visuals-title');
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-gallery.png`,
  });
});
