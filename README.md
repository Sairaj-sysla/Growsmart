# Enterprise Playwright Automation Framework

TypeScript · Page Object Model · Auto-Heal · CI/CD · Allure · Excel Output

---

## What This Framework Does

| Test | What it automates |
|---|---|
| Hotel Search | EasyMyTrip → search hotels → select dates/rooms → sort by price → export Excel |
| Flight + Hotel | EasyMyTrip → round trip flight → hotel selection → export Excel |
| REST API | GET / POST / PATCH / DELETE validation against restful-api.dev |

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Playwright | Browser automation + API testing |
| TypeScript | Type-safe test code |
| Zod | Environment config validation |
| ExcelJS | Export test results to Excel |
| Allure | Rich visual test reports |
| Jenkins | CI/CD pipeline |

---

## Project Structure

```
src/
  tests/
    easyMyTrip.spec.ts          ← Hotel search UI test
    esaymytripfight.spec.ts     ← Flight + Hotel UI test
    users.api.spec.ts           ← REST API tests

  pages/
    basePage.ts                 ← Foundation — all page objects extend this
    easyMyTrip.ts               ← Hotel flow page object
    easyMyTripForFlight.ts      ← Flight + Hotel page object

  utils/
    autoHeal.ts                 ← Auto-heal engine (fixes broken locators)
    elementUtils.ts             ← click / fill / type with retry
    waitUtils.ts                ← Visibility / load state waits
    retryUtils.ts               ← Exponential backoff retry
    errorHandler.ts             ← Centralized error logging
    logger.ts                   ← DEBUG / INFO / PASS / WARN / ERROR / STEP
    fileUtils.ts                ← Excel / CSV / JSON writer
    runtimeStore.ts             ← In-memory key-value store during tests

  config/
    env.index.ts                ← UI config manager (dev / qa)
    env.dev.ts                  ← Dev environment config
    env.qa.ts                   ← QA environment config (default)
    globalTimeout.ts            ← Shared timeout constants

  clients/
    apiClient.ts                ← HTTP client for API tests

test-data/                      ← JSON payloads and UI test data
playwright.config.ts            ← Timeouts, reporters, browser, CI flags
tsconfig.json                   ← Path aliases: @pages, @utils, @tests
Jenkinsfile                     ← CI pipeline config
```

---

## How It Works — UI Test Flow

```
Test file (.spec.ts)
  → Page Object (easyMyTrip.ts)
    → BasePage (click / fill / wait / getText)
      → ElementUtils (retry + auto-heal)
        → Browser (Chromium)
```

## How It Works — API Test Flow

```
Test file (users.api.spec.ts)
  → api.setup.ts (creates APIRequestContext)
    → apiClient.ts (GET / POST / PATCH / DELETE)
      → restful-api.dev
```

---

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run pw:install
```

---

## Run Tests

```bash
# Run all tests
npm test

# Run with QA environment
npm run test:qa

# Run with DEV environment
npm run test:dev

# Run with visible browser
npm run test:qa:headed

# Run in Playwright UI mode
npm run test:qa:ui

# Run in debug mode (step by step)
npm run test:qa:debug

# Run in CI mode
npm run test:ci

# Run specific test file
npx playwright test src/tests/easyMyTrip.spec.ts

# Run specific test by name
npx playwright test -g "EasyMyTrip Hotel Booking Test"

# Run with visible browser + specific file
npx playwright test src/tests/easyMyTrip.spec.ts --headed
```

---

## Environment Variables

### UI Tests

| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `qa` | `qa` or `dev` |
| `BASE_URL` | `https://www.easemytrip.com/` | Base URL |
| `TIMEOUT_ACTION` | `60000` | Action timeout (ms) |
| `TIMEOUT_WAIT` | `60000` | Wait timeout (ms) |
| `TIMEOUT_NAVIGATION` | `45000` | Navigation timeout (ms) |
| `LOG_LEVEL` | `DEBUG` | `DEBUG / INFO / WARN / ERROR` |
| `HEAL_PERSIST_CACHE` | `false` | Set `true` to persist auto-heal fingerprints |

### API Tests

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | `https://api.restful-api.dev` | API base URL |
| `API_TIMEOUT` | `30000` | API timeout (ms) |
| `RETRY_ATTEMPTS` | `1` | Retry count |

### Set environment on Windows

```powershell
# PowerShell
$env:ENVIRONMENT="dev"; npm test

# CMD
set ENVIRONMENT=dev && npx playwright test
```

---

## Playwright Config Summary

| Setting | Local | CI |
|---|---|---|
| Workers | 4 | 2 |
| Retries | 0 | 1 |
| Headless | false | true |
| Test timeout | 900,000 ms | 900,000 ms |
| Expect timeout | 25,000 ms | 25,000 ms |
| Screenshot | Only on failure | Only on failure |
| Video | Retain on failure | Retain on failure |
| Trace | Retain on failure | Retain on failure |
| Locale | en-US | en-US |
| Timezone | Asia/Kolkata | Asia/Kolkata |

---

## Auto-Heal Engine

When a locator fails, the engine automatically tries to find the element using this chain:

```
1. Primary locator           → try original (3s timeout)
2. getByRole                 → semantic ARIA role + name
3. getByLabel                → aria-label attribute
4. getByPlaceholder          → input placeholder
5. CSS selectors             → #id, [data-testid], [name]
6. XPath exact               → xpath=//input[@id='...']
7. XPath contains()          → xpath=//input[contains(@id,"...")]
8. DOM similarity scoring    → Levenshtein score on live DOM attributes
   → If score >= 0.40 → healed
   → Builds precise locator from element's own id/testId/name/aria-label
```

### Scoring weights

| Attribute | Score |
|---|---|
| data-testid | 100 |
| id | 90 |
| aria-label | 85 |
| name | 80 |
| role | 75 |
| placeholder | 70 |
| visible text (exact) | 65 |
| tag + input type | 50 |
| visible text (partial) | 40 |
| CSS class (each) | 20 |

### Example log when healing works

```
[WARN]  Primary not visible — 4 candidates built
[DEBUG] [css]   no match → #txtCityvgfgf
[DEBUG] [xpath] no match → xpath=//input[@id='txtCityvgfgf']
[DEBUG] [xpath] no match → xpath=//input[contains(@id,"txtCityvgfgf")]
[PASS]  Healed on attempt 4/4 via [dom] → #txtCity (score=0.88)
[WARN]  💡 UPDATE YOUR POM: replace broken locator with → #txtCity
```

> When you see **UPDATE YOUR POM** — update the locator in your page object.
> Auto-heal is a safety net, not a permanent solution.

### Auto-heal coverage

Every BasePage method has auto-heal:

```
click / fill / type                → via ElementUtils
doubleClick / rightClick           → direct autoHeal
hover / focus / press              → direct autoHeal
check / uncheck / selectOption     → direct autoHeal
waitForElementIsVisible            → heals before waiting
waitForElementToDisappear          → heals before waiting
waitForElementEnabled              → heals before checking
getText                            → heals before reading
getInputValue                      → heals before reading
scrollToElement                    → heals before scrolling
```

---

## Reports

| Report | Location | Command |
|---|---|---|
| Playwright HTML | `playwright-report/` | `npm run report:show` |
| Allure | `allure-results/` | `npm run report:allure` |
| JUnit XML | `reports/results.xml` | — |
| Excel output | `test-results/excel/` | — |
| Daily logs | `logs/` | — |
| Traces / Videos | `test-results/` | `npx playwright show-trace trace.zip` |

---

## Path Aliases

Use these in imports instead of relative paths:

```typescript
import { FileUtils }   from "@utils/fileUtils";
import { BasePage }    from "@pages/basePage";
import { LoginPage }   from "@pages/login";
```

| Alias | Maps to |
|---|---|
| `@pages/*` | `src/pages/*` |
| `@utils/*` | `src/utils/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@tests/*` | `src/tests/*` |

---

## Add a New UI Test

**Step 1** — Create or update a page object in `src/pages/`:

```typescript
// src/pages/loginPage.ts
import { BasePage } from "./basePage";
import { Page, Locator } from "@playwright/test";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginBtn:      Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.getLocator("#username");
    this.passwordInput = this.getLocator("#password");
    this.loginBtn      = this.getLocator("button[type='submit']");
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginBtn);
  }
}
```

**Step 2** — Create a test in `src/tests/`:

```typescript
// src/tests/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";

test("Login with valid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo("https://app.example.com/login");
  await loginPage.login("admin", "password123");
  await loginPage.assertURL(/dashboard/);
});
```

**Step 3** — Run it:

```bash
npx playwright test -g "Login with valid credentials" --headed
```

---

## Add a New API Test

```typescript
// src/tests/products.api.spec.ts
import { test, expect, APIRequestContext } from "@playwright/test";
import { createAPIClient } from "../setup/api.setup";
import { APIClient } from "../clients/apiClient";

let apiContext: APIRequestContext;
let api: APIClient;

test.beforeAll(async () => {
  const setup = await createAPIClient();
  apiContext   = setup.apiContext;
  api          = setup.client;
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test("Get all products", async () => {
  const response = await api.get("/objects");
  expect(response.status).toBe(200);
  expect(Array.isArray(response.data)).toBe(true);
});
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Browsers missing | `npm run pw:install` |
| Test failing silently | Add `--headed` to see browser |
| Need to debug step by step | Add `--debug` flag |
| Locator not found | Check `[AutoHeal]` logs — it will suggest the correct selector |
| Strict mode violation | Locator matches multiple elements — add `.first()` or use more specific XPath |
| UI config error | Check `ENVIRONMENT`, `BASE_URL`, `TIMEOUT_ACTION` in `.env` |
| API config error | Check `API_BASE_URL`, `API_TIMEOUT` in `.env` |
| Auto-heal cache not working | Set `HEAL_PERSIST_CACHE=true` in `.env` |
| dotenv missing | `npm install dotenv` |
| HTML report not opening | `npm run report:show` |

---

## Known Issues

- `esaymytripfight.spec.ts` — spelling mistake in filename and test name. Use exact name when running by `-g`.
- `GUIDE.md` and `verify-framework.sh` contain old MakeMyTrip references — treat as historical.
- `src/config/config.ts` imports dotenv — if it fails, run `npm install dotenv`.

---

## CI/CD (Jenkins)

When `CI=true`, Playwright automatically:
- Runs headless
- Uses 2 workers
- Retries failed tests once
- Limits to 20 max failures
- Generates HTML + JUnit + Allure reports

```bash
# Typical CI commands
npm ci
npm run pw:install
npm run test:ci
```