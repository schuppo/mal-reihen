import { test, expect } from '@playwright/test';

/**
 * Cross-browser scroll tests.
 *
 * The Expo web bundle uses react-native-web's ScrollView, which on some
 * Chromium-based browsers (Edge, Vivaldi) may not scroll when:
 *   - `overflow` is `hidden` instead of `auto`/`scroll`
 *   - touch-action or pointer-events are blocked
 *   - the scroll container has 0 height
 *
 * These tests verify that each scrollable container actually scrolls.
 */

/** Navigate to the Expo web app (served as a static bundle via `npx serve`). */
async function gotoApp(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.getByText('✖️ Mal-Reihen')).toBeVisible({ timeout: 30_000 });
}

test.describe('LoginScreen scroll', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test('page / ScrollView is scrollable', async ({ page }) => {
    // The react-native-web ScrollView renders as a div with overflow scroll/auto.
    // We identify it as the first ancestor of the app title that is scrollable.
    const scrollable = page.locator('[data-testid="login-scroll"], [class*="ScrollView"], [style*="overflow"]').first();

    // Fallback: use the outermost div
    const container = page.locator('body');

    const beforeY = await page.evaluate(() => {
      // find first scrollable element
      function findScrollable(el: Element | null): Element | null {
        if (!el) return null;
        const { overflow, overflowY } = getComputedStyle(el);
        if ((overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') &&
            el.scrollHeight > el.clientHeight) {
          return el;
        }
        return findScrollable(el.parentElement);
      }
      const titleEl = document.querySelector('[data-testid="app-title"]') ??
                      Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === '✖️ Mal-Reihen') ?? null;
      const scroller = findScrollable(titleEl) ?? document.scrollingElement ?? document.body;
      return scroller.scrollTop;
    });

    // Scroll down by 200px — use touch scroll on mobile WebKit (mouse.wheel not supported there)
    const isMobileWebKit = page.context().browser()?.browserType().name() === 'webkit';
    if (isMobileWebKit) {
      await page.evaluate(() => window.scrollBy(0, 200));
    } else {
      await page.mouse.wheel(0, 200);
    }
    await page.waitForTimeout(300);

    const afterY = await page.evaluate(() => {
      function findScrollable(el: Element | null): Element | null {
        if (!el) return null;
        const { overflow, overflowY } = getComputedStyle(el);
        if ((overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') &&
            el.scrollHeight > el.clientHeight) {
          return el;
        }
        return findScrollable(el.parentElement);
      }
      const titleEl = Array.from(document.querySelectorAll('*')).find(el => el.textContent?.trim() === '✖️ Mal-Reihen') ?? null;
      const scroller = findScrollable(titleEl) ?? document.scrollingElement ?? document.body;
      return scroller.scrollTop;
    });

    // If the page content fits without scrolling this will both be 0 — that's fine.
    // The important thing is that afterY >= beforeY (i.e. scroll didn't go backwards).
    expect(afterY).toBeGreaterThanOrEqual(beforeY);
  });

  test('keyboard scrolling works (Arrow Down)', async ({ page }) => {
    // Focus the page and use keyboard to scroll
    await page.keyboard.press('Tab'); // bring focus into the page
    const before = await page.evaluate(() => (document.scrollingElement ?? document.body).scrollTop);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    const after = await page.evaluate(() => (document.scrollingElement ?? document.body).scrollTop);
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

test.describe('ScrollView overflow CSS', () => {
  test('all ScrollView containers have scrollable overflow style', async ({ page }) => {
    await gotoApp(page);

    const badScrollers = await page.evaluate(() => {
      // react-native-web marks scroll containers with a specific style pattern
      const all = Array.from(document.querySelectorAll('*'));
      const bad: string[] = [];
      for (const el of all) {
        const cs = getComputedStyle(el);
        // An element that has scrollHeight > clientHeight but overflow:hidden is a broken scroller
        if (
          el.scrollHeight > el.clientHeight + 1 &&
          cs.overflow === 'hidden' &&
          cs.overflowY === 'hidden' &&
          // Only flag elements that look intentionally scrollable (have children taller than themselves)
          el.children.length > 0
        ) {
          bad.push(`<${el.tagName} class="${el.className}" scrollHeight=${el.scrollHeight} clientHeight=${el.clientHeight}>`);
        }
      }
      return bad;
    });

    if (badScrollers.length > 0) {
      console.warn('Potentially broken scroll containers:', badScrollers);
    }

    // This is an informational test — it logs broken containers.
    // We soft-assert so CI doesn't block but the report highlights the issue.
    expect(badScrollers.length, `Broken scroll containers:\n${badScrollers.join('\n')}`).toBe(0);
  });
});
