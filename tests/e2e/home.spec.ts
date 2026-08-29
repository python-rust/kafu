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
          rect.width > 0 &&
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

test('desktop homepage exposes the final semantic structure and anchor navigation', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
  ).toBeInViewport();
  await expect(
    page.getByText('UNOFFICIAL FAN PROJECT / NON-COMMERCIAL').first(),
  ).toBeInViewport();
  await expect(
    page.locator('#top').getByRole('img', { name: /粉色短发的花譜正面肖像/ }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: 'Official Site' }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: /Enter the Journey/i }),
  ).toBeInViewport();

  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeAttached();
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    'content',
    '#f7f4f3',
  );

  const visualSystemContract = await page.evaluate(() => {
    const readFontSize = (selector: string) => {
      const element = document.querySelector(selector);

      if (!element) {
        throw new Error(`Missing visual-system contract target: ${selector}`);
      }

      return Number.parseFloat(getComputedStyle(element).fontSize);
    };

    return {
      bodyFontSize: readFontSize('body'),
      navFontSize: readFontSize('header nav a'),
      sectionHeadingSizes: ['#journey h2', '#works h2', '#visuals h2'].map(
        readFontSize,
      ),
      documentHeight: document.documentElement.scrollHeight,
    };
  });

  expect(visualSystemContract.bodyFontSize).toBeGreaterThanOrEqual(16);
  expect(visualSystemContract.navFontSize).toBeGreaterThanOrEqual(12);
  expect(
    Math.max(...visualSystemContract.sectionHeadingSizes),
  ).toBeLessThanOrEqual(80);
  expect(visualSystemContract.documentHeight).toBeLessThan(14_000);

  const navigation = page.getByRole('navigation', {
    name: 'KAF homepage sections',
  });
  await expect(navigation).toBeVisible();

  const expectedTargets = [
    ['Journey', '#journey'],
    ['Works', '#works'],
    ['Gallery', '#visuals'],
    ['Official Links', '#links'],
  ] as const;

  for (const [label, href] of expectedTargets) {
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  }

  await navigation.getByRole('link', { name: 'Journey' }).click();
  await expect(
    page.getByRole('heading', { name: '声と景色、その六つの章。' }),
  ).toBeInViewport();

  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole('navigation', { name: 'KAF homepage sections' })
    .getByRole('link', { name: 'Works' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Selected Works' }),
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

test('small-text tokens and the primary hero action retain readable contrast', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const contrast = await page.evaluate(() => {
    function parseColor(value: string) {
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

      return channels;
    }

    function relativeLuminance(value: string) {
      const [red, green, blue] = parseColor(value).map(
        (channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        },
      );

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
    const paper = rootStyle.getPropertyValue('--color-paper-clean').trim();
    const faintInk = rootStyle.getPropertyValue('--color-ink-faint').trim();
    const deepBlue = rootStyle.getPropertyValue('--color-blue-deep').trim();
    const heroAction = document.querySelector<HTMLElement>(
      '#top a[href="https://kaf.kamitsubaki.jp/"]',
    );

    if (!heroAction) {
      throw new Error('Primary hero action was not found.');
    }

    const actionStyle = getComputedStyle(heroAction);

    return {
      faintInkOnPaper: ratio(faintInk, paper),
      deepBlueOnPaper: ratio(deepBlue, paper),
      heroAction: ratio(actionStyle.color, actionStyle.backgroundColor),
    };
  });

  expect(contrast.faintInkOnPaper).toBeGreaterThanOrEqual(4.5);
  expect(contrast.deepBlueOnPaper).toBeGreaterThanOrEqual(4.5);
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

  await scrollToCenter(page, chapterAnchors[5]);
  await expect(page.locator(chapterAnchors[5])).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(stage.getByText('2025–2026', { exact: true })).toBeVisible();

  await scrollToCenter(page, '#works-title');
  await expect(
    page.getByRole('heading', { name: 'Selected Works' }),
  ).toBeInViewport();
  await page
    .locator('#works article')
    .first()
    .evaluate((element) => {
      element.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  await expect(stage).not.toBeInViewport();
});

test('mobile homepage keeps the journey linear, touch-safe, and source-ordered', async ({
  page,
}) => {
  await openHome(page, { width: 390, height: 844 });

  await expect(
    page.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
  ).toBeInViewport();
  await expect(
    page.getByText('UNOFFICIAL FAN PROJECT / NON-COMMERCIAL').first(),
  ).toBeInViewport();
  await expect(
    page.locator('#top').getByRole('img', { name: /粉色短发的花譜正面肖像/ }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: 'Official Site' }),
  ).toBeInViewport();
  await expect(
    page.getByRole('link', { name: /Enter the Journey/i }),
  ).toBeInViewport();
  await expectNoHorizontalOverflow(page, '390×844 hero');

  const stage = page.getByTestId('journey-sticky-stage');
  await expect(stage).toBeHidden();

  const chapterArticles = page.locator('#journey article[data-journey-index]');
  await expect(chapterArticles).toHaveCount(6);

  for (const chapterAnchor of chapterAnchors) {
    await expect(page.locator(chapterAnchor)).toBeAttached();
  }

  const navTargets = page
    .getByRole('navigation', { name: 'KAF homepage sections' })
    .getByRole('link');
  const navTargetCount = await navTargets.count();

  for (let index = 0; index < navTargetCount; index += 1) {
    const box = await navTargets.nth(index).boundingBox();
    expect(box, `mobile nav target ${index + 1}`).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await scrollToCenter(page, '#visuals');
  const galleryTitles = await page
    .locator('#visuals figure h3')
    .allTextContents();
  expect(galleryTitles).toEqual([
    '花譜ちゃん',
    '忘れてしまえ',
    '不可解',
    '糸',
    '過去を喰らう',
    '景色',
    'チューイン・ディスコ',
    'ユーフォーを見にいこう',
  ]);
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
        .getByRole('navigation', { name: 'KAF homepage sections' })
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

test('reduced motion renders all six chapters without the desktop sticky stage', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page, { width: 1440, height: 900 });

  await expect(
    page.getByRole('heading', { level: 1, name: /花譜.*KAF/i }),
  ).toBeVisible();
  await expect(page.getByTestId('journey-sticky-stage')).toHaveCount(0);
  await expect(
    page.locator('#journey article[data-journey-index]'),
  ).toHaveCount(6);

  for (const chapterAnchor of chapterAnchors) {
    await scrollToCenter(page, chapterAnchor);
    await expect(page.locator(chapterAnchor)).toBeInViewport();
  }

  const heroMotionState = await page
    .locator('#top')
    .locator('h1')
    .evaluate((element) => {
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

test('only the hero image is eager/high-priority and all shipped images have intrinsic sizing', async ({
  page,
}) => {
  await openHome(page, { width: 1440, height: 900 });

  const imageLoading = await page.locator('img').evaluateAll((images) =>
    images.map((image) => ({
      fetchPriority: image.getAttribute('fetchpriority'),
      height: image.getAttribute('height'),
      loading: image.getAttribute('loading'),
      src: image.getAttribute('src'),
      width: image.getAttribute('width'),
    })),
  );
  const uniqueSources = new Set(imageLoading.map((image) => image.src));
  const eagerImages = imageLoading.filter((image) => image.loading === 'eager');

  expect(uniqueSources.size).toBeGreaterThanOrEqual(9);
  expect(eagerImages).toHaveLength(1);
  expect(eagerImages[0]?.fetchPriority).toBe('high');

  for (const image of imageLoading) {
    expect(Number(image.width)).toBeGreaterThan(0);
    expect(Number(image.height)).toBeGreaterThan(0);

    if (image !== eagerImages[0]) {
      expect(image.loading).toBe('lazy');
      expect(image.fetchPriority).not.toBe('high');
    }
  }
});

test('captures the required integration visual evidence', async ({ page }) => {
  const evidenceDirectory = 'test-results/kaf-integration-visual-evidence';

  await openHome(page, { width: 1440, height: 900 });
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-hero.png`,
  });

  await scrollToCenter(page, chapterAnchors[0]);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-journey-early.png`,
  });

  await scrollToCenter(page, chapterAnchors[2]);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-journey-middle.png`,
  });

  await scrollToCenter(page, chapterAnchors[5]);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-journey-final.png`,
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

  await scrollToCenter(page, chapterAnchors[2]);
  await page.screenshot({
    path: `${evidenceDirectory}/390x844-linear-journey.png`,
  });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page, { width: 1440, height: 900 });
  await scrollToCenter(page, chapterAnchors[2]);
  await page.screenshot({
    path: `${evidenceDirectory}/1440x900-reduced-motion.png`,
  });
});
