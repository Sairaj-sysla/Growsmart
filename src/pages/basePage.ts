// ============================================================================
//  BASE PAGE - ENTERPRISE LEVEL
// ----------------------------------------------------------------------------
//  HOW IT WORKS:
//  ------------
//  BasePage is the foundation for ALL page objects in this framework.
//
//  FLOW:
//  Test → PageObject.someAction() → BasePage.click() → ElementUtils.click()
//                                                     → RetryUtils.retry()
//                                                     → ErrorHandler.handle()
//
//  LAYERS:
//  ┌─────────────────────────────────┐
//  │  Test File (.spec.ts)           │  ← calls page object methods
//  ├─────────────────────────────────┤
//  │  Page Object (LoginPage, etc.)  │  ← extends BasePage
//  ├─────────────────────────────────┤
//  │  BasePage (this file)           │  ← wraps all actions with logging
//  ├─────────────────────────────────┤
//  │  ElementUtils / WaitUtils       │  ← low-level Playwright wrappers
//  ├─────────────────────────────────┤
//  │  RetryUtils / ErrorHandler      │  ← retry + error capture
//  └─────────────────────────────────┘
//
//  AUTO-HEAL COVERAGE:
//  -------------------
//  ✔ click / fill / type          → via ElementUtils (always)
//  ✔ doubleClick / rightClick     → direct autoHeal call
//  ✔ hover / focus / press        → direct autoHeal call
//  ✔ check / uncheck              → direct autoHeal call
//  ✔ selectOption                 → direct autoHeal call
//  ✔ waitForElementIsVisible      → heals before waiting
//  ✔ waitForElementToDisappear    → heals before waiting
//  ✔ waitForElementEnabled        → heals before checking
//  ✔ getText                      → heals before reading
//  ✔ getInputValue                → heals before reading
//  ✔ scrollToElement              → heals before scrolling
//
//  getLocator vs getElementName:
//  ─────────────────────────────
//  getLocator()     → converts string/XPath to Playwright Locator (for browser)
//  getElementName() → extracts human-readable name for logs only (never touches browser)
// ============================================================================

import { Page, Locator, FrameLocator, expect } from "@playwright/test";
import { ElementUtils } from "../utils/elementUtils";
import { WaitUtils } from "../utils/waitUtils";
import { ErrorHandler } from "../utils/errorHandler";
import { RetryOptions } from "../utils/retryUtils";
import { configManager } from "../config/env.index";
import { Global_Timeout } from "../config/globalTimeout";
import { Runtime } from "../utils/runtimeStore";
import { logger } from "../utils/logger";
import { autoHeal } from "../utils/autoHeal";

export class BasePage {
  protected page: Page;
  private _currentFrame: FrameLocator | null = null;

  constructor(page: Page) {
    this.page = page;
  }

  // ==========================================================================
  //  SELECTOR NORMALIZATION + AUTO-NAME
  // --------------------------------------------------------------------------
  //  getLocator()     → converts any selector into a Playwright Locator
  //                     used by every action method to interact with browser
  //
  //  getElementName() → extracts a readable string label for log messages
  //                     never touches the browser — logs only
  // ==========================================================================

  protected getLocator(selector: string | Locator): Locator {
    try {
      if (typeof selector !== "string") return selector;
      if (selector.startsWith("//") || selector.startsWith("xpath=")) {
        return this.page.locator(`xpath=${selector.replace("xpath=", "")}`);
      }
      return this.page.locator(selector);
    } catch (error: any) {
      logger.error(`getLocator failed → ${selector} → ${error.message}`);
      throw new Error(`getLocator failed → ${selector} → ${error.message}`);
    }
  }

  protected getElementName(selector: string | Locator, explicitLabel?: string): string {
    if (explicitLabel) return explicitLabel;
    try {
      if (typeof selector !== "string") {
        try {
          for (const key of Object.getOwnPropertyNames(this)) {
            if ((this as any)[key] === selector) return key;
          }
        } catch { /* ignore */ }
        try {
          const s = selector.toString();
          const roleMatch  = s.match(/getByRole\((.*?)\)/);
          const textMatch  = s.match(/getByText\((.*?)\)/);
          const testMatch  = s.match(/getByTestId\((.*?)\)/);
          const cssMatch   = s.match(/locator\("([^"]+)"\)/);
          const xpathMatch = s.match(/locator\('xpath=(.*?)'\)/);
          if (roleMatch)  return roleMatch[1].replace(/["{}]/g, "").trim();
          if (textMatch)  return `text=${textMatch[1].replace(/["]/g, "")}`;
          if (testMatch)  return `testId=${testMatch[1].replace(/["]/g, "")}`;
          if (cssMatch)   return this.extractLabelFromSelector(cssMatch[1]);
          if (xpathMatch) return this.extractLabelFromSelector(xpathMatch[1]);
        } catch { /* ignore */ }
        return "UnknownElement";
      }
      return this.extractLabelFromSelector(selector);
    } catch (error: any) {
      logger.error(`getElementName failed: ${error.message}`);
      return "UnknownElement";
    }
  }

  private extractLabelFromSelector(selector: string): string {
    try {
      let clean = selector.replace(/^css=/, "").replace(/^xpath=/, "").trim();
      if (clean.startsWith("#")) return clean.slice(1);
      if (clean.startsWith(".")) return clean.replace(/\./g, "-");
      const textMatch = clean.match(/text\((.*?)\)|text=['"](.*?)['"]/);
      if (textMatch) return (textMatch[1] || textMatch[2]).trim().replace(/\s+/g, "_");
      if (clean.startsWith("//") || clean.includes("@")) {
        return clean.replace(/[^a-zA-Z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 30);
      }
      return clean.substring(0, 30);
    } catch (error: any) {
      logger.error(`extractLabelFromSelector failed: ${error.message}`);
      return "unknown-selector";
    }
  }

  // ==========================================================================
  //  NAVIGATION
  // ==========================================================================

  /**
   * navigateTo — navigate to absolute URL.
   * Uses "load" state 
   * continuous background requests that never reach networkidle.
   */
  async navigateTo(url: string): Promise<this> {
    logger.step(`Navigate To → ${url}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout:   Global_Timeout.navigation,
        });
        // ── "load" not "networkidle" ──────────────────────────────────────
        // networkidle never fires on sites with continuous background XHR
        // load fires once all initial resources are downloaded
        await WaitUtils.waitForLoadState(this.page, "load", Global_Timeout.navigation);
        logger.pass(`Navigated to → ${url}`);
        return this;
      } catch (error: any) {
        logger.error(`navigateTo failed → ${url} → ${error.message}`);
        throw new Error(`navigateTo failed → ${url} → ${error.message}`);
      }
    }, { context: `BasePage.navigateTo (${url})` });
  }

  /**
   * goto — navigate using baseURL + relative path.
   * @example await this.goto("/login");
   */
  async goto(path = "/"): Promise<this> {
    const fullUrl = `${configManager.getBaseURL()}${path}`;
    logger.step(`Goto → ${fullUrl}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.navigateTo(fullUrl);
        return this;
      } catch (error: any) {
        logger.error(`goto failed → ${path} → ${error.message}`);
        throw new Error(`goto failed → ${path} → ${error.message}`);
      }
    }, { context: `BasePage.goto (${path})` });
  }

  async reload(): Promise<this> {
    logger.step("Reload Page");
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.reload({ waitUntil: "domcontentloaded" });
        logger.pass("Page reloaded");
        return this;
      } catch (error: any) {
        logger.error(`reload failed → ${error.message}`);
        throw new Error(`reload failed → ${error.message}`);
      }
    }, { context: "BasePage.reload" });
  }

  async goBack(): Promise<this> {
    logger.step("Go Back");
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.goBack({ waitUntil: "domcontentloaded" });
        logger.pass("Navigation back successful");
        return this;
      } catch (error: any) {
        logger.error(`goBack failed → ${error.message}`);
        throw new Error(`goBack failed → ${error.message}`);
      }
    }, { context: "BasePage.goBack" });
  }

  async goForward(): Promise<this> {
    logger.step("Go Forward");
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.goForward({ waitUntil: "domcontentloaded" });
        logger.pass("Navigation forward successful");
        return this;
      } catch (error: any) {
        logger.error(`goForward failed → ${error.message}`);
        throw new Error(`goForward failed → ${error.message}`);
      }
    }, { context: "BasePage.goForward" });
  }

  // ==========================================================================
  //  ELEMENT ACTIONS — all with auto-heal via ElementUtils or direct autoHeal
  // ==========================================================================

  async click(
    selector: string | Locator,
    options?: { force?: boolean; label?: string; retryOptions?: RetryOptions }
  ): Promise<this> {
    const name = this.getElementName(selector, options?.label);
    logger.debug(`Click → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await ElementUtils.click(this.getLocator(selector), { timeout: Global_Timeout.action, ...options, label: name });
        logger.pass(`Clicked → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`click failed → ${name} → ${error.message}`);
        throw new Error(`click failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.click (${name})` });
  }

  async doubleClick(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Double Click → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] doubleClick healed via [${strategy}] → ${name}`);
        await healed.dblclick({ timeout: Global_Timeout.action });
        logger.pass(`Double-clicked → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`doubleClick failed → ${name} → ${error.message}`);
        throw new Error(`doubleClick failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.doubleClick (${name})` });
  }

  async rightClick(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Right Click → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] rightClick healed via [${strategy}] → ${name}`);
        await healed.click({ button: "right", timeout: Global_Timeout.action });
        logger.pass(`Right-clicked → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`rightClick failed → ${name} → ${error.message}`);
        throw new Error(`rightClick failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.rightClick (${name})` });
  }

  async fill(
    selector: string | Locator,
    text: string,
    options?: { label?: string; retryOptions?: RetryOptions }
  ): Promise<this> {
    const name = this.getElementName(selector, options?.label);
    logger.debug(`Fill → ${name} | Value: "${text}"`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await ElementUtils.fill(this.getLocator(selector), text, { timeout: Global_Timeout.action, ...options, label: name });
        logger.pass(`Filled → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`fill failed → ${name} → ${error.message}`);
        throw new Error(`fill failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.fill (${name})` });
  }

  async type(
    selector: string | Locator,
    text: string,
    delay?: number,
    options?: { label?: string; retryOptions?: RetryOptions }
  ): Promise<this> {
    const name = this.getElementName(selector, options?.label);
    logger.debug(`Type → ${name} | Value: "${text}" | Delay: ${delay ?? 50}ms`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await ElementUtils.type(this.getLocator(selector), text, { timeout: Global_Timeout.action, delay, ...options, label: name });
        logger.pass(`Typed → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`type failed → ${name} → ${error.message}`);
        throw new Error(`type failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.type (${name})` });
  }

  async clear(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Clear → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await ElementUtils.clear(this.getLocator(selector));
        logger.pass(`Cleared → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`clear failed → ${name} → ${error.message}`);
        throw new Error(`clear failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.clear (${name})` });
  }

  async selectOption(selector: string | Locator, value: string | string[]): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Select Option → ${name} | Value: ${JSON.stringify(value)}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] selectOption healed via [${strategy}] → ${name}`);
        await healed.selectOption(value, { timeout: Global_Timeout.action });
        logger.pass(`Selected option → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`selectOption failed → ${name} → ${error.message}`);
        throw new Error(`selectOption failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.selectOption (${name})` });
  }

  async check(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Check → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] check healed via [${strategy}] → ${name}`);
        await healed.check({ timeout: Global_Timeout.action });
        logger.pass(`Checked → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`check failed → ${name} → ${error.message}`);
        throw new Error(`check failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.check (${name})` });
  }

  async uncheck(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Uncheck → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] uncheck healed via [${strategy}] → ${name}`);
        await healed.uncheck({ timeout: Global_Timeout.action });
        logger.pass(`Unchecked → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`uncheck failed → ${name} → ${error.message}`);
        throw new Error(`uncheck failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.uncheck (${name})` });
  }

  async hover(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Hover → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] hover healed via [${strategy}] → ${name}`);
        await healed.hover({ timeout: Global_Timeout.action });
        logger.pass(`Hovered → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`hover failed → ${name} → ${error.message}`);
        throw new Error(`hover failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.hover (${name})` });
  }

  async focus(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Focus → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] focus healed via [${strategy}] → ${name}`);
        await healed.focus({ timeout: Global_Timeout.action });
        logger.pass(`Focused → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`focus failed → ${name} → ${error.message}`);
        throw new Error(`focus failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.focus (${name})` });
  }

  async press(selector: string | Locator, key: string): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Press → ${name} | Key: "${key}"`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Global_Timeout.action);
        if (wasHealed) logger.warn(`[AutoHeal] press healed via [${strategy}] → ${name}`);
        await healed.press(key, { timeout: Global_Timeout.action });
        logger.pass(`Pressed "${key}" on → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`press failed → ${name} → ${error.message}`);
        throw new Error(`press failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.press (${name})` });
  }

  // ==========================================================================
  //  KEYBOARD & MOUSE (GLOBAL)
  // ==========================================================================

  async pressKey(key: string): Promise<this> {
    logger.debug(`Press key → "${key}"`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.keyboard.press(key);
        logger.pass(`Key pressed → "${key}"`);
        return this;
      } catch (error: any) {
        logger.error(`pressKey failed → "${key}" → ${error.message}`);
        throw new Error(`pressKey failed → "${key}" → ${error.message}`);
      }
    }, { context: `BasePage.pressKey (${key})` });
  }

  async typeText(text: string): Promise<this> {
    logger.debug(`Type text globally → "${text}"`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.keyboard.type(text);
        logger.pass(`Typed globally → "${text}"`);
        return this;
      } catch (error: any) {
        logger.error(`typeText failed → ${error.message}`);
        throw new Error(`typeText failed → ${error.message}`);
      }
    }, { context: "BasePage.typeText" });
  }

  async mouseClick(x: number, y: number, button: "left" | "right" | "middle" = "left", clickCount: number = 1): Promise<this> {
    logger.debug(`Mouse click → x=${x}, y=${y} | button=${button} | clicks=${clickCount}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.mouse.click(x, y, { button, clickCount });
        logger.pass(`Mouse clicked → x=${x}, y=${y}`);
        return this;
      } catch (error: any) {
        logger.error(`mouseClick failed → ${error.message}`);
        throw new Error(`mouseClick failed → ${error.message}`);
      }
    }, { context: `BasePage.mouseClick (${x}, ${y})` });
  }

  async mouseMove(x: number, y: number): Promise<this> {
    logger.debug(`Mouse move → x=${x}, y=${y}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.mouse.move(x, y);
        logger.pass(`Mouse moved → x=${x}, y=${y}`);
        return this;
      } catch (error: any) {
        logger.error(`mouseMove failed → ${error.message}`);
        throw new Error(`mouseMove failed → ${error.message}`);
      }
    }, { context: `BasePage.mouseMove (${x}, ${y})` });
  }

  async dragAndDrop(source: string | Locator, target: string | Locator): Promise<this> {
    const sourceName = this.getElementName(source);
    const targetName = this.getElementName(target);
    logger.debug(`Drag → ${sourceName} to ${targetName}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.getLocator(source).dragTo(this.getLocator(target));
        logger.pass(`Dragged ${sourceName} → ${targetName}`);
        return this;
      } catch (error: any) {
        logger.error(`dragAndDrop failed → ${sourceName} → ${targetName} → ${error.message}`);
        throw new Error(`dragAndDrop failed → ${sourceName} → ${targetName} → ${error.message}`);
      }
    }, { context: `BasePage.dragAndDrop (${sourceName} → ${targetName})` });
  }

  // ==========================================================================
  //  NEW TAB / WINDOW HANDLING
  // ==========================================================================

  async clickAndGetNewTab(selector: string | Locator): Promise<Page> {
    const name = this.getElementName(selector);
    logger.step(`Click and get new tab → ${name}`);
    return ErrorHandler.handle<Page>(async () => {
      try {
        const [newPage] = await Promise.all([
          this.page.context().waitForEvent("page"),
          this.getLocator(selector).click(),
        ]);
        await newPage.waitForLoadState("domcontentloaded");
        logger.pass(`New tab opened → ${newPage.url()}`);
        return newPage;
      } catch (error: any) {
        logger.error(`clickAndGetNewTab failed → ${name} → ${error.message}`);
        throw new Error(`clickAndGetNewTab failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.clickAndGetNewTab (${name})` });
  }

  async switchToTab(index: number): Promise<Page> {
    logger.step(`Switch to tab → [${index}]`);
    return ErrorHandler.handle<Page>(async () => {
      try {
        const pages = this.page.context().pages();
        if (index >= pages.length) throw new Error(`Tab index [${index}] out of range. Found ${pages.length} tab(s).`);
        const tab = pages[index];
        await tab.bringToFront();
        logger.pass(`Switched to tab [${index}] → ${tab.url()}`);
        return tab;
      } catch (error: any) {
        logger.error(`switchToTab failed → [${index}] → ${error.message}`);
        throw new Error(`switchToTab failed → [${index}] → ${error.message}`);
      }
    }, { context: `BasePage.switchToTab (${index})` });
  }

  getTabCount(): number {
    const count = this.page.context().pages().length;
    logger.debug(`Tab count → ${count}`);
    return count;
  }

  // ==========================================================================
  //  WAIT METHODS — all with auto-heal
  // ==========================================================================

  async waitForElementIsVisible(selector: string | Locator, timeout?: number): Promise<this> {
    const name     = this.getElementName(selector);
    const waitTime = timeout || Global_Timeout.wait;
    logger.debug(`Wait visible → ${name} (${waitTime}ms)`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Math.min(10000, waitTime));
        if (wasHealed) logger.warn(`[AutoHeal] waitForElementIsVisible healed via [${strategy}] → ${name}`);
        await WaitUtils.waitForElementIsVisible(healed, waitTime);
        logger.pass(`Visible → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`waitForElementIsVisible failed → ${name} → ${error.message}`);
        throw new Error(`waitForElementIsVisible failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.waitForElementIsVisible (${name})` });
  }

  async waitForElementToDisappear(selector: string | Locator, timeout?: number): Promise<this> {
    const name     = this.getElementName(selector);
    const waitTime = timeout || Global_Timeout.wait;
    logger.debug(`Wait disappear → ${name} (${waitTime}ms)`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), Math.min(10000, waitTime));
        if (wasHealed) logger.warn(`[AutoHeal] waitForElementToDisappear healed via [${strategy}] → ${name}`);
        await WaitUtils.waitForElementToDisappear(healed, waitTime);
        logger.pass(`Disappeared → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`waitForElementToDisappear failed → ${name} → ${error.message}`);
        throw new Error(`waitForElementToDisappear failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.waitForElementToDisappear (${name})` });
  }

  async waitForElementEnabled(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    logger.debug(`Wait enabled → ${name}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), 3000);
        if (wasHealed) logger.warn(`[AutoHeal] waitForElementEnabled healed via [${strategy}] → ${name}`);
        await expect(healed).toBeEnabled({ timeout: Global_Timeout.wait });
        logger.pass(`Enabled → ${name}`);
        return this;
      } catch (error: any) {
        logger.error(`waitForElementEnabled failed → ${name} → ${error.message}`);
        throw new Error(`waitForElementEnabled failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.waitForElementEnabled (${name})` });
  }

  async waitForURL(url: string | RegExp): Promise<this> {
    logger.debug(`Wait URL → ${url}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.waitForURL(url, { timeout: Global_Timeout.navigation });
        logger.pass(`URL matched → ${url}`);
        return this;
      } catch (error: any) {
        logger.error(`waitForURL failed → expected: ${url} | current: ${this.page.url()}`);
        throw new Error(`waitForURL failed → expected: ${url} → ${error.message}`);
      }
    }, { context: `BasePage.waitForURL (${url})` });
  }

  async waitForLoadState(state: "load" | "domcontentloaded" | "networkidle" = "load"): Promise<this> {
    logger.debug(`Wait loadState → ${state}`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.page.waitForLoadState(state, { timeout: Global_Timeout.navigation });
        logger.pass(`LoadState reached → ${state}`);
        return this;
      } catch (error: any) {
        logger.error(`waitForLoadState failed → ${state} → ${error.message}`);
        throw new Error(`waitForLoadState failed → ${state} → ${error.message}`);
      }
    }, { context: `BasePage.waitForLoadState (${state})` });
  }

  async waitForTextOnPage(text: string | RegExp, timeout?: number): Promise<this> {
    const waitTime = timeout || Global_Timeout.wait;
    logger.debug(`Wait text → "${text}" (${waitTime}ms)`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.page.getByText(text)).toBeVisible({ timeout: waitTime });
        logger.pass(`Text appeared → "${text}"`);
        return this;
      } catch (error: any) {
        logger.error(`waitForTextOnPage failed → "${text}" → ${error.message}`);
        throw new Error(`waitForTextOnPage failed → ${text} → ${error.message}`);
      }
    }, { context: `BasePage.waitForTextOnPage (${text})` });
  }

  async waitForTextDisappear(text: string | RegExp, timeout?: number): Promise<this> {
    const waitTime = timeout || Global_Timeout.wait;
    logger.debug(`Wait text disappear → "${text}" (${waitTime}ms)`);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.page.getByText(text)).not.toBeVisible({ timeout: waitTime });
        logger.pass(`Text disappeared → "${text}"`);
        return this;
      } catch (error: any) {
        logger.error(`waitForTextDisappear failed → "${text}" → ${error.message}`);
        throw new Error(`waitForTextDisappear failed → ${text} → ${error.message}`);
      }
    }, { context: `BasePage.waitForTextDisappear (${text})` });
  }

  // ==========================================================================
  //  ASSERTIONS
  // ==========================================================================

  async assertElementVisible(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toBeVisible({ timeout: Global_Timeout.wait });
        logger.pass(`Visible → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertElementVisible failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertElementVisible (${name})` });
  }

  async assertElementHidden(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toBeHidden({ timeout: Global_Timeout.wait });
        logger.pass(`Hidden → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertElementHidden failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertElementHidden (${name})` });
  }

  async assertElementEnabled(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toBeEnabled({ timeout: Global_Timeout.wait });
        logger.pass(`Enabled → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertElementEnabled failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertElementEnabled (${name})` });
  }

  async assertElementDisabled(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toBeDisabled({ timeout: Global_Timeout.wait });
        logger.pass(`Disabled → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertElementDisabled failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertElementDisabled (${name})` });
  }

  async assertText(selector: string | Locator, text: string | RegExp): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toHaveText(text, { timeout: Global_Timeout.wait });
        logger.pass(`Text matched → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertText failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertText (${name})` });
  }

  async assertContainsText(selector: string | Locator, text: string): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toContainText(text, { timeout: Global_Timeout.wait });
        logger.pass(`Contains text → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertContainsText failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertContainsText (${name})` });
  }

  async assertValue(selector: string | Locator, value: string | RegExp): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toHaveValue(value, { timeout: Global_Timeout.wait });
        logger.pass(`Value matched → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertValue failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertValue (${name})` });
  }

  async assertAttributeValue(selector: string | Locator, attribute: string, value: string): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toHaveAttribute(attribute, value, { timeout: Global_Timeout.wait });
        logger.pass(`Attribute matched → ${name}[${attribute}]`);
        return this;
      } catch (error: any) {
        throw new Error(`assertAttributeValue failed → ${name}[${attribute}] → ${error.message}`);
      }
    }, { context: `BasePage.assertAttributeValue (${name})` });
  }

  async assertChecked(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toBeChecked({ timeout: Global_Timeout.wait });
        logger.pass(`Checked → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertChecked failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertChecked (${name})` });
  }

  async assertNotChecked(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).not.toBeChecked({ timeout: Global_Timeout.wait });
        logger.pass(`Not checked → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`assertNotChecked failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertNotChecked (${name})` });
  }

  async assertURL(url: string | RegExp): Promise<this> {
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.page).toHaveURL(url, { timeout: Global_Timeout.wait });
        logger.pass("URL matched");
        return this;
      } catch (error: any) {
        logger.error(`assertURL failed → expected: ${url} | actual: ${this.page.url()}`);
        throw new Error(`assertURL failed → expected: ${url} → ${error.message}`);
      }
    }, { context: `BasePage.assertURL (${url})` });
  }

  async assertTitle(title: string | RegExp): Promise<this> {
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.page).toHaveTitle(title, { timeout: Global_Timeout.wait });
        logger.pass("Title matched");
        return this;
      } catch (error: any) {
        const actual = await this.page.title();
        logger.error(`assertTitle failed → expected: "${title}" | actual: "${actual}"`);
        throw new Error(`assertTitle failed → expected: ${title} → ${error.message}`);
      }
    }, { context: `BasePage.assertTitle (${title})` });
  }

  async assertElementCount(selector: string | Locator, count: number): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await expect(this.getLocator(selector)).toHaveCount(count, { timeout: Global_Timeout.wait });
        logger.pass(`Count matched → ${name} = ${count}`);
        return this;
      } catch (error: any) {
        const actual = await this.getLocator(selector).count();
        logger.error(`assertElementCount failed → ${name} | expected: ${count} | actual: ${actual}`);
        throw new Error(`assertElementCount failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.assertElementCount (${name})` });
  }

  // ==========================================================================
  //  QUERY METHODS
  // ==========================================================================

  async isVisible(selector: string | Locator): Promise<boolean> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<boolean>(async () => {
      try { return await this.getLocator(selector).isVisible(); }
      catch (error: any) { throw new Error(`isVisible failed → ${name} → ${error.message}`); }
    }, { context: `BasePage.isVisible (${name})` });
  }

  async isEnabled(selector: string | Locator): Promise<boolean> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<boolean>(async () => {
      try { return await this.getLocator(selector).isEnabled(); }
      catch (error: any) { throw new Error(`isEnabled failed → ${name} → ${error.message}`); }
    }, { context: `BasePage.isEnabled (${name})` });
  }

  async isChecked(selector: string | Locator): Promise<boolean> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<boolean>(async () => {
      try { return await this.getLocator(selector).isChecked(); }
      catch (error: any) { throw new Error(`isChecked failed → ${name} → ${error.message}`); }
    }, { context: `BasePage.isChecked (${name})` });
  }

  async getText(selector: string | Locator): Promise<string> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<string>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), 3000);
        if (wasHealed) logger.warn(`[AutoHeal] getText healed via [${strategy}] → ${name}`);
        await healed.waitFor({ state: "visible", timeout: Global_Timeout.wait });
        return (await healed.textContent())?.trim() || "";
      } catch (error: any) {
        throw new Error(`getText failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.getText (${name})` });
  }

  async getInputValue(selector: string | Locator): Promise<string> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<string>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), 3000);
        if (wasHealed) logger.warn(`[AutoHeal] getInputValue healed via [${strategy}] → ${name}`);
        return await healed.inputValue();
      } catch (error: any) {
        throw new Error(`getInputValue failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.getInputValue (${name})` });
  }

  async getAttribute(selector: string | Locator, attribute: string): Promise<string | null> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<string | null>(async () => {
      try { return await this.getLocator(selector).getAttribute(attribute); }
      catch (error: any) { throw new Error(`getAttribute failed → ${name}[${attribute}] → ${error.message}`); }
    }, { context: `BasePage.getAttribute (${name})` });
  }

  async getElementCount(selector: string | Locator): Promise<number> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<number>(async () => {
      try { return await this.getLocator(selector).count(); }
      catch (error: any) { throw new Error(`getElementCount failed → ${name} → ${error.message}`); }
    }, { context: `BasePage.getElementCount (${name})` });
  }

  // ==========================================================================
  //  DIALOG HANDLING
  // ==========================================================================

  acceptDialog(promptText?: string): this {
    logger.debug("Dialog handler registered → Accept");
    this.page.once("dialog", (dialog) => {
      logger.pass(`Dialog accepted: ${dialog.message()}`);
      dialog.accept(promptText);
    });
    return this;
  }

  dismissDialog(): this {
    logger.debug("Dialog handler registered → Dismiss");
    this.page.once("dialog", (dialog) => {
      logger.pass(`Dialog dismissed: ${dialog.message()}`);
      dialog.dismiss();
    });
    return this;
  }

  // ==========================================================================
  //  IFRAME HANDLING
  // ==========================================================================

  async switchToFrame(selector: string | Locator): Promise<FrameLocator> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<FrameLocator>(async () => {
      try {
        const frameLocator = this.getLocator(selector).contentFrame();
        this._currentFrame = frameLocator;
        logger.pass(`Switched to frame → ${name}`);
        return frameLocator;
      } catch (error: any) {
        throw new Error(`switchToFrame failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.switchToFrame (${name})` });
  }

  async switchToFrameByIndex(index: number): Promise<FrameLocator> {
    return ErrorHandler.handle<FrameLocator>(async () => {
      try {
        const frames = this.page.frames();
        const actualIndex = index + 1;
        if (actualIndex >= frames.length) throw new Error(`Frame index [${index}] out of range.`);
        const frameLocator = this.page.frameLocator(`iframe:nth-of-type(${actualIndex})`);
        this._currentFrame = frameLocator;
        logger.pass(`Switched to frame [${index}]`);
        return frameLocator;
      } catch (error: any) {
        throw new Error(`switchToFrameByIndex failed → [${index}] → ${error.message}`);
      }
    }, { context: `BasePage.switchToFrameByIndex (${index})` });
  }

  async switchToFrameByName(name: string): Promise<FrameLocator> {
    return ErrorHandler.handle<FrameLocator>(async () => {
      try {
        const frameLocator = this.page.frameLocator(`iframe[name="${name}"]`);
        this._currentFrame = frameLocator;
        logger.pass(`Switched to frame by name → "${name}"`);
        return frameLocator;
      } catch (error: any) {
        throw new Error(`switchToFrameByName failed → "${name}" → ${error.message}`);
      }
    }, { context: `BasePage.switchToFrameByName (${name})` });
  }

  async switchToFrameById(id: string): Promise<FrameLocator> {
    return ErrorHandler.handle<FrameLocator>(async () => {
      try {
        const frameLocator = this.page.frameLocator(`iframe#${id}`);
        this._currentFrame = frameLocator;
        logger.pass(`Switched to frame by id → "${id}"`);
        return frameLocator;
      } catch (error: any) {
        throw new Error(`switchToFrameById failed → "${id}" → ${error.message}`);
      }
    }, { context: `BasePage.switchToFrameById (${id})` });
  }

  async switchToMainFrame(): Promise<this> {
    this._currentFrame = null;
    logger.pass("Back to main frame");
    return this;
  }

  getCurrentFrame(): FrameLocator | null { return this._currentFrame; }

  getFrameCount(): number {
    return this.page.frames().length - 1;
  }

  // ==========================================================================
  //  FILE UPLOAD
  // ==========================================================================

  async uploadFile(selector: string | Locator, filePaths: string | string[]): Promise<this> {
    const name  = this.getElementName(selector);
    const files = Array.isArray(filePaths) ? filePaths : [filePaths];
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.getLocator(selector).setInputFiles(files);
        logger.pass(`File(s) uploaded → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`uploadFile failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.uploadFile (${name})` });
  }

  async clearFileUpload(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        await this.getLocator(selector).setInputFiles([]);
        logger.pass(`File upload cleared → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`clearFileUpload failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.clearFileUpload (${name})` });
  }

  // ==========================================================================
  //  COOKIES & LOCAL STORAGE
  // ==========================================================================

  async getCookie(name: string): Promise<string | undefined> {
    const cookies = await this.page.context().cookies();
    const cookie  = cookies.find(c => c.name === name);
    logger.pass(`Cookie "${name}" → ${cookie?.value ?? "not found"}`);
    return cookie?.value;
  }

  async clearCookies(): Promise<this> {
    await this.page.context().clearCookies();
    logger.pass("Cookies cleared");
    return this;
  }

  async getLocalStorageItem(key: string): Promise<string | null> {
    return this.page.evaluate((k) => window.localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key: string, value: string): Promise<this> {
    await this.page.evaluate(({ k, v }) => window.localStorage.setItem(k, v), { k: key, v: value });
    return this;
  }

  async clearLocalStorage(): Promise<this> {
    await this.page.evaluate(() => window.localStorage.clear());
    return this;
  }

  // ==========================================================================
  //  NETWORK INTERCEPTION
  // ==========================================================================

  async mockAPIResponse(urlPattern: string, responseBody: object, status: number = 200): Promise<this> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(responseBody) });
    });
    logger.pass(`API mocked → ${urlPattern}`);
    return this;
  }

  async blockRequest(urlPattern: string): Promise<this> {
    await this.page.route(urlPattern, (route) => route.abort());
    logger.pass(`Request blocked → ${urlPattern}`);
    return this;
  }

  // ==========================================================================
  //  JAVASCRIPT EXECUTION
  // ==========================================================================

  async executeScript<T = void>(script: string): Promise<T> {
    return ErrorHandler.handle<T>(async () => {
      try {
        const result = await this.page.evaluate(script);
        logger.pass("Script executed");
        return result as T;
      } catch (error: any) {
        throw new Error(`executeScript failed → ${error.message}`);
      }
    }, { context: "BasePage.executeScript" });
  }

  // ==========================================================================
  //  CLIPBOARD
  // ==========================================================================

  async getClipboardText(): Promise<string> {
    return ErrorHandler.handle<string>(async () => {
      try {
        const text = await this.page.evaluate(() => navigator.clipboard.readText());
        logger.pass(`Clipboard text → "${text}"`);
        return text;
      } catch (error: any) {
        throw new Error(`getClipboardText failed → ${error.message}`);
      }
    }, { context: "BasePage.getClipboardText" });
  }

  // ==========================================================================
  //  SCROLL METHODS
  // ==========================================================================

  async scrollToElement(selector: string | Locator): Promise<this> {
    const name = this.getElementName(selector);
    return ErrorHandler.handle<this>(async () => {
      try {
        const { locator: healed, healed: wasHealed, strategy } =
          await autoHeal(this.getLocator(selector), 3000);
        if (wasHealed) logger.warn(`[AutoHeal] scrollToElement healed via [${strategy}] → ${name}`);
        await healed.scrollIntoViewIfNeeded({ timeout: 5000 });
        logger.pass(`Scrolled to → ${name}`);
        return this;
      } catch (error: any) {
        throw new Error(`scrollToElement failed → ${name} → ${error.message}`);
      }
    }, { context: `BasePage.scrollToElement (${name})` });
  }

  async scrollToTop(): Promise<this> {
    return ErrorHandler.handle<this>(async () => {
      await this.page.evaluate(() => window.scrollTo(0, 0));
      logger.pass("Scrolled to top");
      return this;
    }, { context: "BasePage.scrollToTop" });
  }

  async scrollToBottom(): Promise<this> {
    return ErrorHandler.handle<this>(async () => {
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      logger.pass("Scrolled to bottom");
      return this;
    }, { context: "BasePage.scrollToBottom" });
  }

  async scrollBy(x: number, y: number): Promise<this> {
    return ErrorHandler.handle<this>(async () => {
      await this.page.evaluate(
        ({ scrollX, scrollY }) => window.scrollBy(scrollX, scrollY),
        { scrollX: x, scrollY: y }
      );
      logger.pass(`Scrolled by x=${x}, y=${y}`);
      return this;
    }, { context: "BasePage.scrollBy" });
  }

  // ==========================================================================
  //  SCREENSHOT METHODS
  // ==========================================================================

  async takeScreenshot(name = "screenshot"): Promise<void> {
    const fileName = `${name}_${Date.now()}.png`;
    return ErrorHandler.handle<void>(async () => {
      try {
        await this.page.screenshot({ path: `test-results/screenshots/${fileName}`, fullPage: true });
        logger.pass(`Screenshot saved → ${fileName}`);
      } catch (error: any) {
        throw new Error(`takeScreenshot failed → ${fileName} → ${error.message}`);
      }
    }, { context: `BasePage.takeScreenshot (${fileName})` });
  }

  async takeElementScreenshot(selector: string | Locator, name = "element"): Promise<void> {
    const elemName = this.getElementName(selector);
    const fileName = `${name}_${Date.now()}.png`;
    return ErrorHandler.handle<void>(async () => {
      try {
        await this.getLocator(selector).screenshot({ path: `test-results/screenshots/${fileName}` });
        logger.pass(`Element screenshot saved → ${fileName}`);
      } catch (error: any) {
        throw new Error(`takeElementScreenshot failed → ${elemName} → ${error.message}`);
      }
    }, { context: `BasePage.takeElementScreenshot (${elemName})` });
  }

  // ==========================================================================
  //  MISC UTILITIES
  // ==========================================================================

  getCurrentURL(): string { return this.page.url(); }

  async getTitle(): Promise<string> { return this.page.title(); }

  getPage(): Page { return this.page; }

  async pause(milliseconds = 1000): Promise<this> {
    logger.warn(`pause → ${milliseconds}ms (avoid in production tests)`);
    await this.page.waitForTimeout(milliseconds);
    return this;
  }

  // ==========================================================================
  //  RUNTIME STORE HELPERS
  // ==========================================================================

  async storeTextContent(selector: Locator | string, key: string): Promise<void> {
    return ErrorHandler.handle<void>(async () => {
      try {
        const loc = this.getLocator(selector);
        await loc.waitFor({ state: "visible", timeout: Global_Timeout.wait });
        const value = (await loc.textContent())?.trim() || "";
        Runtime.set(key, value);
        logger.pass(`Stored text → ${key}: "${value}"`);
      } catch (error: any) {
        throw new Error(`storeTextContent failed → ${key} → ${error.message}`);
      }
    }, { context: `BasePage.storeTextContent (${key})` });
  }

  async storeInputValue(selector: Locator | string, key: string): Promise<void> {
    return ErrorHandler.handle<void>(async () => {
      let value = "";
      try { value = (await this.getLocator(selector).inputValue())?.trim() || ""; }
      catch { value = ""; }
      Runtime.set(key, value);
      logger.pass(`Stored input → ${key}: "${value}"`);
    }, { context: `BasePage.storeInputValue (${key})` });
  }

  async storeAttributeValue(selector: Locator | string, attribute: string, key: string): Promise<void> {
    return ErrorHandler.handle<void>(async () => {
      try {
        const value = (await this.getLocator(selector).getAttribute(attribute))?.trim() || "";
        Runtime.set(key, value);
        logger.pass(`Stored attribute → ${key} [${attribute}]: "${value}"`);
      } catch (error: any) {
        throw new Error(`storeAttributeValue failed → ${key} → ${error.message}`);
      }
    }, { context: `BasePage.storeAttributeValue (${key})` });
  }
}