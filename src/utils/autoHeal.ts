// ============================================================================
//  AUTO-HEAL ENGINE - Runtime DOM Recovery + Playwright Smart Healing
// ----------------------------------------------------------------------------
//  FLOW:
//  Original Locator
//    -> getByRole()
//    -> getByLabel()
//    -> getByPlaceholder()
//    -> getByText()
//    -> CSS Recovery
//    -> XPath Recovery (exact + contains)
//    -> DOM Similarity Recovery (fixed locator syntax)
//    -> Fail Clearly
// ============================================================================

import { Locator, Page } from "@playwright/test";
import { logger } from "./logger";

type PlaywrightRole = Parameters<Page["getByRole"]>[0];

export type HealStrategy =
  | "primary"
  | "getByRole"
  | "getByLabel"
  | "getByPlaceholder"
  | "getByText"
  | "css"
  | "xpath"
  | "dom";

export interface HealResult {
  locator: Locator;
  healed: boolean;
  strategy: HealStrategy;
  selector?: string;
}

interface RuntimeHints {
  raw: string;
  selector?: string;
  tag?: string;
  attributes: Record<string, string>;
  role?: PlaywrightRole;
  name?: string;
  label?: string;
  placeholder?: string;
  text?: string;
  cssSelectors: string[];
  xpathSelectors: string[];
}

interface HealingAttempt {
  strategy: Exclude<HealStrategy, "primary">;
  locator: Locator;
  selector: string;
}

const ROLE_BY_TAG: Record<string, PlaywrightRole> = {
  a:        "link",
  button:   "button",
  select:   "combobox",
  textarea: "textbox",
};

const INPUT_ROLE_BY_TYPE: Record<string, PlaywrightRole> = {
  button:   "button",
  checkbox: "checkbox",
  email:    "textbox",
  number:   "spinbutton",
  password: "textbox",
  radio:    "radio",
  search:   "searchbox",
  submit:   "button",
  tel:      "textbox",
  text:     "textbox",
  url:      "textbox",
};

// Attributes we score during DOM similarity recovery
const SCORED_ATTRS = ["id", "name", "placeholder", "aria-label", "title", "class", "type"];

const MAX_HINT_LENGTH = 80;

// ============================================================================
//  VISIBILITY
// ============================================================================
async function isVisible(locator: Locator, timeout = 1500): Promise<boolean> {
  try {
    await locator.first().waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
//  STRING HELPERS
// ============================================================================
function cleanHint(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/\\(["'])/g, "$1").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length > MAX_HINT_LENGTH) return undefined;
  return cleaned;
}

function unique(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const c = cleanHint(value);
    if (!c || seen.has(c)) continue;
    seen.add(c);
    output.push(c);
  }
  return output;
}

function firstMatch(source: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    const value = cleanHint(match?.[1] || match?.[2]);
    if (value) return value;
  }
  return undefined;
}

function decodeLocatorString(value: string): string {
  return value.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function allMatches(source: string, patterns: RegExp[]): string[] {
  const values: string[] = [];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = cleanHint(match[1] || match[2]);
      if (value) values.push(value);
    }
  }
  return unique(values);
}

function allAttributeValues(source: string, attributeNames: string[]): string[] {
  const values: string[] = [];
  for (const attributeName of attributeNames) {
    const cssPattern = new RegExp(`\\[${attributeName}=\\\\?["']([^"'\\\\]+)\\\\?["']\\]`, "g");
    const xpathPattern = new RegExp(`@${attributeName}=\\\\?["']([^"'\\\\]+)\\\\?["']`, "g");
    values.push(...allMatches(source, [cssPattern, xpathPattern]));
  }
  return unique(values);
}

function extractSelector(raw: string): string | undefined {
  const match = raw.match(/locator\((['"`])((?:\\.|(?!\1).)+)\1\)/);
  return match?.[2] ? decodeLocatorString(match[2]) : undefined;
}

function extractAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const normalized = decodeLocatorString(source);
  const patterns = [
    /@([\w:-]+)=["']([^"']+)["']/g,
    /\[([\w:-]+)=["']([^"']+)["']\]/g,
  ];
  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const name = match[1]?.toLowerCase();
      const value = cleanHint(match[2]);
      if (name && value && !attributes[name]) attributes[name] = value;
    }
  }
  return attributes;
}

function extractTag(selector: string | undefined): string | undefined {
  if (!selector) return undefined;
  const normalized = selector.replace(/^xpath=/, "").replace(/^css=/, "").trim();
  const xpathTag = normalized.match(/^\/\/\s*([a-zA-Z][\w-]*|\*)/)?.[1];
  const cssTag   = normalized.match(/^([a-zA-Z][\w-]*)/)?.[1];
  const tag = xpathTag || cssTag;
  return tag && tag !== "*" ? tag.toLowerCase() : undefined;
}

function inferRole(selector: string | undefined, raw: string): PlaywrightRole | undefined {
  const explicit = firstMatch(raw, [
    /getByRole\(['"`]([^'"`]+)['"`]/,
    /\[role=["']?([a-zA-Z-]+)["']?\]/,
    /@role=["']([^"']+)["']/,
  ]);
  if (explicit) return explicit as PlaywrightRole;

  if (!selector) return undefined;

  const tag = extractTag(selector);
  if (tag && ROLE_BY_TAG[tag]) return ROLE_BY_TAG[tag];

  const inputType = firstMatch(selector, [
    /input[^"'[\]]*\[type=["']?([^"'\]]+)["']?\]/,
    /@type=["']([^"']+)["']/,
  ]);
  if (tag === "input") {
    return inputType ? INPUT_ROLE_BY_TYPE[inputType.toLowerCase()] : "textbox";
  }

  return undefined;
}

function cssEscape(value: string): string {
  return value.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function cssString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function xpathString(value: string): string {
  return value.replace(/"/g, '\\"');
}

function inferCssSelectors(selector: string | undefined, raw: string): string[] {
  const exactSelector = selector?.startsWith("css=")
    ? selector.replace(/^css=/, "")
    : selector && !selector.startsWith("xpath=") && !selector.startsWith("//")
      ? selector : undefined;

  const ids = allMatches(raw, [
    /#([A-Za-z][\w-]*)/g,
    /\[@id=\\?["']([^"'\\]+)\\?["']\]/g,
    /@id=\\?["']([^"'\\]+)\\?["']/g,
  ]).map(id => `#${cssEscape(id)}`);

  const dataAttributes = allAttributeValues(raw, ["data-testid", "data-cy", "data-qa"])
    .map(v => `[data-testid="${cssString(v)}"], [data-cy="${cssString(v)}"], [data-qa="${cssString(v)}"]`);

  const names = allMatches(raw, [
    /\[name=\\?["']([^"'\\]+)\\?["']\]/g,
    /@name=\\?["']([^"'\\]+)\\?["']/g,
  ]).map(v => `[name="${cssString(v)}"]`);

  const ariaLabels = allMatches(raw, [
    /\[aria-label=\\?["']([^"'\\]+)\\?["']\]/g,
    /@aria-label=\\?["']([^"'\\]+)\\?["']/g,
  ]).map(v => `[aria-label="${cssString(v)}"]`);

  const placeholders = allMatches(raw, [
    /\[placeholder=\\?["']([^"'\\]+)\\?["']\]/g,
    /@placeholder=\\?["']([^"'\\]+)\\?["']/g,
  ]).map(v => `[placeholder="${cssString(v)}"]`);

  return unique([exactSelector, ...ids, ...dataAttributes, ...names, ...ariaLabels, ...placeholders]);
}

function inferXPathSelectors(
  selector: string | undefined,
  hints: Partial<RuntimeHints>,
  // ── NEW: pass the original raw attributes so we can build contains() selectors
  attributes: Record<string, string> = {}
): string[] {
  const exactXPath = selector?.startsWith("xpath=")
    ? selector
    : selector?.startsWith("//") ? `xpath=${selector}` : undefined;

  const text        = hints.text || hints.name || hints.label;
  const placeholder = hints.placeholder;

  // ── Exact attribute matches ─────────────────────────────────────────────
  const exactSelectors: Array<string | undefined> = [
    exactXPath,
    text         ? `xpath=//*[normalize-space()="${xpathString(text)}"]`          : undefined,
    text         ? `xpath=//*[contains(normalize-space(),"${xpathString(text)}")]` : undefined,
    placeholder  ? `xpath=//*[@placeholder="${xpathString(placeholder)}"]`         : undefined,
    hints.label  ? `xpath=//*[@aria-label="${xpathString(hints.label)}"]`          : undefined,
  ];

  // ── contains() selectors built from ACTUAL attribute values (KEY FIX) ────
  // Only useful when we extract a meaningful base value from the selector.
  // e.g. selector has @id="txtCity" → contains(@id,"txtCity") is useful
  // Do NOT build contains() from broken values like "txtCityvgfgf" — useless
  const containsSelectors: Array<string | undefined> = [];

  for (const [attr, val] of Object.entries(attributes)) {
    if (!val || val.length < 3) continue;

    // Skip values that look like mangled/broken names (long with random chars)
    // Only use values that look like clean identifiers
    if (!/^[a-zA-Z][\w-]*$/.test(val)) continue;

    const escaped = xpathString(val);

    if (["id", "name", "class"].includes(attr)) {
      const tag = hints.tag || "*";
      containsSelectors.push(`xpath=//${tag}[contains(@${attr},"${escaped}")]`);
    }

    if (attr === "aria-label") {
      containsSelectors.push(`xpath=//*[contains(@aria-label,"${escaped}")]`);
    }

    if (attr === "placeholder") {
      containsSelectors.push(`xpath=//*[contains(@placeholder,"${escaped}")]`);
    }
  }

  return unique([...exactSelectors, ...containsSelectors]);
}

function buildHints(locator: Locator): RuntimeHints {
  const raw      = locator.toString();
  const selector = extractSelector(raw);
  const attributes = extractAttributes(selector || raw);

  const label = firstMatch(raw, [
    /getByLabel\(['"`]([^'"`]+)['"`]/,
    /aria-label=["']([^"']+)["']/,
    /@aria-label=["']([^"']+)["']/,
    /\[name=["']([^"']+)["']\]/,
    /@name=["']([^"']+)["']/,
  ]);

  const placeholder = firstMatch(raw, [
    /getByPlaceholder\(['"`]([^'"`]+)['"`]/,
    /placeholder=["']([^"']+)["']/,
    /@placeholder=["']([^"']+)["']/,
  ]);

  // ── visible text only — NOT id or name ──────────────────────────────────
  const text = firstMatch(raw, [
    /getByText\(['"`]([^'"`]+)['"`]/,
    /has-text\(["']([^"']+)["']\)/,
    /text=["']([^"']+)["']/,
    /text\(\)=["']([^"']+)["']/,
    /normalize-space\(\)=["']([^"']+)["']/,
    /contains\(normalize-space\(\),\s*["']([^"']+)["']\)/,
    /contains\(text\(\),\s*["']([^"']+)["']\)/,
  ]);

  // ── name = accessible name for getByRole (aria-label or visible text) ──
  const name = firstMatch(raw, [
    /getByRole\(['"`][^'"`]+['"`],\s*\{\s*name:\s*['"`]([^'"`]+)['"`]/,
    /title=["']([^"']+)["']/,
    /@title=["']([^"']+)["']/,
  ]) || text || label || placeholder;

  const role        = inferRole(selector, raw);
  const partialHints: Partial<RuntimeHints> = { label, name, placeholder, role, text, tag: extractTag(selector) };

  return {
    raw,
    selector,
    tag:           extractTag(selector),
    attributes,
    role,
    name,
    label,
    placeholder,
    text,
    cssSelectors:  inferCssSelectors(selector, raw),
    // Pass attributes so contains() selectors are generated
    xpathSelectors: inferXPathSelectors(selector, partialHints, attributes),
  };
}

// ============================================================================
//  LEVENSHTEIN + SIMILARITY
// ============================================================================
function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = i - 1;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const old = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = old;
    }
  }
  return prev[b.length];
}

function longestCommonPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

function similarity(a: string, b: string): number {
  const left  = a.toLowerCase();
  const right = b.toLowerCase();
  if (!left || !right) return 0;
  if (left === right)  return 1;

  // One is a prefix of the other — core value unchanged, suffix added
  // e.g. "txtCity" vs "txtCityvgfgf" → left starts with right → 0.88
  if (left.startsWith(right) || right.startsWith(left)) return 0.88;

  // One contains the other
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }

  const editScore   = 1 - levenshtein(left, right) / Math.max(left.length, right.length);
  const prefixScore = longestCommonPrefix(left, right) / Math.min(left.length, right.length);
  return Math.max(editScore, prefixScore);
}

// ============================================================================
//  DOM RECOVERY
// ============================================================================
async function buildDomRecoveryAttempts(page: Page, hints: RuntimeHints): Promise<HealingAttempt[]> {
  const scoredAttrs = Object.entries(hints.attributes)
    .filter(([name]) => SCORED_ATTRS.includes(name));

  if (!hints.tag || scoredAttrs.length === 0) return [];

  // ── Extract candidates WITH their unique attribute signature for locating ─
  const candidates = await page.locator(hints.tag).evaluateAll(
    (elements, attrNames: string[]) => {
      function isVisible(el: Element): boolean {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.visibility !== "hidden" && s.display !== "none" && r.width > 0 && r.height > 0;
      }
      return elements
        .filter(isVisible)
        .map((el) => {
          const attrs: Record<string, string> = {};
          for (const name of attrNames) {
            const val = el.getAttribute(name);
            if (val) attrs[name] = val;
          }
          // Capture the best unique attribute to build a precise locator
          // Priority: id > data-testid > name > aria-label > placeholder
          const id          = el.getAttribute("id");
          const testId      = el.getAttribute("data-testid") || el.getAttribute("data-cy");
          const name        = el.getAttribute("name");
          const ariaLabel   = el.getAttribute("aria-label");
          const placeholder = el.getAttribute("placeholder");

          return {
            attrs,
            id,
            testId,
            name,
            ariaLabel,
            placeholder,
          };
        });
    },
    scoredAttrs.map(([name]) => name)
  );

  const ranked = candidates
    .map(candidate => {
      const score = scoredAttrs.reduce((best, [name, expected]) => {
        const actual = candidate.attrs[name];
        return actual ? Math.max(best, similarity(expected, actual)) : best;
      }, 0);
      return { ...candidate, score };
    })
    .filter(c => c.score >= 0.4)
    .sort((a, b) => b.score - a.score);

  logger.debug(`[AutoHeal] DOM scan found ${ranked.length} candidates for <${hints.tag}>`);
  ranked.forEach(c => logger.debug(`  score=${c.score.toFixed(2)} attrs=${JSON.stringify(c.attrs)}`));

  // ── Build PRECISE locators using the element's own attributes ─────────────
  // Never use .nth(index) — index shifts when DOM changes
  // Instead build a selector FROM the element's actual attributes
  return ranked.slice(0, 3).map(candidate => {

    let preciseLocator: Locator;
    let preciseSelector: string;

    if (candidate.id) {
      // Best — id is unique
      preciseSelector = `#${candidate.id}`;
      preciseLocator  = page.locator(preciseSelector);

    } else if (candidate.testId) {
      preciseSelector = `[data-testid="${candidate.testId}"]`;
      preciseLocator  = page.locator(preciseSelector);

    } else if (candidate.name) {
      preciseSelector = `${hints.tag}[name="${candidate.name}"]`;
      preciseLocator  = page.locator(preciseSelector);

    } else if (candidate.ariaLabel) {
      preciseSelector = `[aria-label="${candidate.ariaLabel}"]`;
      preciseLocator  = page.locator(preciseSelector);

    } else if (candidate.placeholder) {
      preciseSelector = `[placeholder="${candidate.placeholder}"]`;
      preciseLocator  = page.locator(preciseSelector);

    } else {
      // Last resort — contains on best matching attribute
      const [bestAttr, bestVal] = Object.entries(candidate.attrs)[0] ?? [];
      preciseSelector = bestAttr
        ? `xpath=//${hints.tag}[contains(@${bestAttr},"${bestVal}")]`
        : hints.tag!;
      preciseLocator  = page.locator(preciseSelector);
    }

    return {
      strategy: "dom" as const,
      locator:  preciseLocator,
      selector: `${preciseSelector} (score=${candidate.score.toFixed(2)} attrs=${JSON.stringify(candidate.attrs)})`,
    };
  });
}

// ============================================================================
//  HEALING ATTEMPTS
// ============================================================================
function buildHealingAttempts(page: Page, hints: RuntimeHints): HealingAttempt[] {
  const attempts: HealingAttempt[] = [];

  if (hints.role && hints.name) {
    attempts.push({
      strategy: "getByRole",
      locator:  page.getByRole(hints.role, { name: hints.name, exact: false }),
      selector: `getByRole(${hints.role}, name=${hints.name})`,
    });
  }

  if (hints.label) {
    attempts.push({
      strategy: "getByLabel",
      locator:  page.getByLabel(hints.label, { exact: false }),
      selector: `getByLabel(${hints.label})`,
    });
  }

  if (hints.placeholder) {
    attempts.push({
      strategy: "getByPlaceholder",
      locator:  page.getByPlaceholder(hints.placeholder, { exact: false }),
      selector: `getByPlaceholder(${hints.placeholder})`,
    });
  }

  if (hints.text) {
    attempts.push({
      strategy: "getByText",
      locator:  page.getByText(hints.text, { exact: false }),
      selector: `getByText(${hints.text})`,
    });
  }

  for (const selector of hints.cssSelectors) {
    attempts.push({ strategy: "css",   locator: page.locator(selector), selector });
  }

  for (const selector of hints.xpathSelectors) {
    attempts.push({ strategy: "xpath", locator: page.locator(selector), selector });
  }

  return attempts;
}

// ============================================================================
//  MAIN
// ============================================================================
/**
 * autoHeal
 * --------------------------------------------------------------------------
 * Resolves a usable Locator with lightweight runtime DOM recovery.
 * Stateless — no cache, no file I/O, no fingerprint database.
 *
 * Strategy order:
 *  1. getByRole / getByLabel / getByPlaceholder / getByText (Playwright-native)
 *  2. CSS selectors (id, data-testid, name, aria-label, placeholder)
 *  3. XPath selectors (exact + contains() for partial attribute changes)
 *  4. DOM similarity scoring (Levenshtein on live element attributes)
 */
export async function autoHeal(locator: Locator, timeout = 3000): Promise<HealResult> {

  // ── Primary ───────────────────────────────────────────────────────────────
  if (await isVisible(locator, timeout)) {
    return { locator, healed: false, strategy: "primary" };
  }

  const page    = locator.page();
  const hints   = buildHints(locator);
  const attempts = [
    ...buildHealingAttempts(page, hints),
    ...await buildDomRecoveryAttempts(page, hints),
  ];

  logger.warn(
    `[AutoHeal] Primary not visible — ${attempts.length} recovery candidates built` +
    ` -> ${hints.raw}`
  );

  // ── Try each strategy ─────────────────────────────────────────────────────
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];

    if (await isVisible(attempt.locator, 1200)) {
      logger.pass(
        `[AutoHeal] Healed on attempt ${i + 1}/${attempts.length}` +
        ` via [${attempt.strategy}] -> ${attempt.selector}`
      );
      // ── Prominent POM update hint so devs don't miss it ─────────────────
      logger.warn(
        `[AutoHeal] 💡 UPDATE YOUR POM:` +
        ` replace broken locator with -> ${attempt.selector.split(" (")[0]}`
      );
      return {
        locator:  attempt.locator.first(),
        healed:   true,
        strategy: attempt.strategy,
        selector: attempt.selector,
      };
    }
    logger.debug(`[AutoHeal] [${attempt.strategy}] no match -> ${attempt.selector}`);
  }

  // ── All failed ────────────────────────────────────────────────────────────
  logger.error(`[AutoHeal] All ${attempts.length} strategies failed -> ${hints.raw}`);
  return { locator, healed: false, strategy: "primary" };
}