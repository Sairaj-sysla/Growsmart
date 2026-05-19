# 🚀 Enterprise Playwright Automation Framework

A production-grade test automation framework built with **Playwright & TypeScript**, featuring a runtime auto-heal engine, Page Object Model, multi-environment config, reusable utilities, API automation, and enterprise-grade reporting.

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![CI/CD](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=flat&logo=jenkins&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [What We Built](#-what-we-built)
- [Key Features](#-key-features)
- [Auto-Heal Engine](#-auto-heal-engine)
- [Test Data System](#-test-data-system-tdp)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running Tests](#-running-tests)
- [Reporting](#-reporting)
- [Framework Components](#-framework-components)
- [Best Practices](#-best-practices)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)
- [Path Aliases](#-path-aliases)
- [Current Repo Notes](#-current-repo-notes)

---

## 🎯 Overview

This framework automates real-world UI and API flows and demonstrates an enterprise-style test automation architecture.

| Test Suite | What It Automates |
|---|---|
| **Hotel Booking** | EasyMyTrip hotel search, dates/rooms flow, price sorting, Excel export |
| **Flight + Hotel** | EasyMyTrip round-trip flight search, hotel selection, checkout details, Excel export |
| **REST API** | GET / POST / PATCH / DELETE validation against `restful-api.dev` by default |

### What Makes This Enterprise-Grade?

- ✅ **Design Patterns** — Page Object Model, Singleton config/runtime helpers
- ✅ **SOLID Direction** — reusable page, utility, config, and API layers
- ✅ **Auto-Heal Engine** — runtime DOM recovery without external AI dependency
- ✅ **TDP Test Data System** — JSON data profiles through `set()`, `sets()`, `override()`, `merge()`
- ✅ **Runtime Store** — `$()` and `$$()` global shortcuts for sharing values during a run
- ✅ **Multi-Environment** — DEV/QA UI config with Zod validation
- ✅ **Comprehensive Reporting** — Playwright HTML, Allure, JUnit, logs, traces, videos, screenshots, Excel output
- ✅ **CI/CD Ready** — Jenkinsfile and CI-specific Playwright behavior

---

## 🛠 What We Built

Core framework files:

- `src/pages/basePage.ts` — enterprise base class with navigation, actions, waits, assertions, frames, tabs, storage, network helpers, screenshots, and runtime store helpers
- `src/utils/autoHeal.ts` — runtime DOM recovery engine
- `src/utils/elementUtils.ts` — click/fill/type helpers with retry and auto-heal
- `src/pages/easyMyTrip.ts` — EasyMyTrip hotel page object
- `src/pages/easyMyTripForFlight.ts` — EasyMyTrip flight + hotel page object
- `src/utils/runtimeStore.ts` and `src/utils/runtimeGlobal.ts` — `$()` / `$$()` shortcuts
- `src/utils/set.ts` — simple TDP system: `set()`, `sets()`, `override()`, `merge()`
- `playwright.config.ts` — runtime Playwright config with environment, CI, reporter, timeout, and browser settings
- `src/clients/apiClient.ts` and `src/setup/api.setup.ts` — reusable REST API layer

Active test/data files:

- `src/tests/easyMyTrip.spec.ts` — hotel booking UI test
- `src/tests/esaymytripfight.spec.ts` — 2 flight booking tests using `flightData.json`
- `src/tests/users.api.spec.ts` — REST API tests
- `test-data/ui/flightData.json` — flight booking data sets
- `test-data/ui/mmt-search-data.json` — legacy/search data
- `test-data/api/sample-payloads.json` — API payload data

---

## ✨ Key Features

| Feature | Description | Business Value |
|---|---|---|
| BasePage Pattern | 50+ shared browser methods with logging, retry, and error context | Reduces duplication and keeps POMs consistent |
| Auto-Heal Engine | Runtime locator recovery via semantic hints, selectors, XPath, and DOM similarity | Helps tests survive minor UI locator changes |
| TDP Test Data | JSON data profiles loaded by `set("file", 1)` | Keeps test data outside specs and page objects |
| Runtime Store | `$("key")` / `$$("key")` shortcuts | Shares captured values across test steps |
| Smart Retry | Retry wrapper around element interactions | Improves stability for slow/flaky UI behavior |
| Config Manager | Zod-validated DEV/QA config | Makes environment switching predictable |
| API Client | Consistent GET/POST/PUT/PATCH/DELETE wrapper | Keeps API tests concise and uniform |
| Excel Output | `FileUtils.writeExcelAuto()` | Exports collected UI data per test run |

---

## 🩹 Auto-Heal Engine

When a locator is not visible, `autoHeal()` attempts runtime recovery through a strategy chain. It does not require a fingerprint database.

### Strategy Chain

```text
Locator not visible
        ↓
1. Primary locator
2. getByRole         -> semantic ARIA role + accessible name
3. getByLabel        -> label / aria-label hints
4. getByPlaceholder  -> input placeholder text
5. getByText         -> extracted text values, including union XPath text
6. CSS selectors     -> #id, [data-testid], [data-cy], [data-qa], [name], [aria-label]
7. XPath selectors   -> exact and contains-style XPath recovery
8. DOM similarity    -> visible DOM scan with string similarity scoring
        ↓
First match -> HEALED   |   All fail -> original error context
```

### Current Auto-Heal Capabilities

```typescript
// Union XPath text extraction
// (//span[text()="HOTELS"] | //span[text()="Hotels"])[1]
// Extracts both: ["HOTELS", "Hotels"]

// DOM scan supports text-only elements
// Useful for spans/buttons where the original locator contains text but no id/name.

// Tag extraction handles XPath branches that start with "("
// Example: (//span[text()="HOTELS"] | //span[text()="Hotels"])[1]

// Suggested locator output
// Logs: UPDATE YOUR POM: replace broken locator with -> selector
```

### DOM Similarity Signals

The DOM recovery layer compares available hints such as:

| Signal | Source |
|---|---|
| `id` | CSS or XPath attribute |
| `name` | input/form attributes |
| `placeholder` | input placeholder |
| `aria-label` | accessible label |
| `title` | title attribute |
| `class` | class attribute |
| `type` | input type |
| visible text | text locators / XPath text |

### Example Log

```text
[WARN]  [AutoHeal] Primary not visible - 4 recovery candidates built
[DEBUG] [AutoHeal] [css] no match -> #txtCityvgfgf
[DEBUG] [AutoHeal] [xpath] no match -> xpath=//input[@id='txtCityvgfgf']
[PASS]  [AutoHeal] Healed on attempt 4/4 via [dom] -> #txtCity
[WARN]  [AutoHeal] UPDATE YOUR POM: replace broken locator with -> #txtCity
```

When you see **UPDATE YOUR POM**, update the page object locator. Auto-heal is a safety net, not a permanent fix.

---

## 📦 Test Data System (TDP)

This framework includes a TestSigma-style test data profile utility in `src/utils/set.ts`.

### JSON Structure

```json
{
  "profile": "Flight Booking Profile",
  "sets": [
    {
      "setName": "Set 1",
      "description": "Chennai to Bangalore Business",
      "from": "chennai",
      "to": "bangalore",
      "tripType": "roundTrip",
      "departDays": 0,
      "returnDays": 5,
      "adults": 2,
      "children": 1,
      "travelClass": "Business"
    }
  ]
}
```

### One Import

```typescript
import { set, sets, override, merge } from "@utils/set";
```

### Usage Examples

```typescript
// Get by 1-based index
const data = set("flightData", 1);
data.from;        // "chennai"
data.travelClass; // "Business"

// Get by set name
const data = set("flightData", "Set 2");

// Run all sets
for (const data of sets("flightData")) {
  console.log(data.setName);
}

// Override one field and keep the rest from JSON
const data = override("flightData", 1, { from: "pune" });

// Override with runtime variable
const data = override("flightData", 1, { from: $("selectedCity") });

// Merge two profiles
const data = merge(["flightData", 1], ["userProfile", 1]);
```

### TestSigma TDP Comparison

| TestSigma | This Framework |
|---|---|
| Test Data Profile | JSON file in `test-data/ui/` |
| Set 1, Set 2 | `set("file", 1)`, `set("file", 2)` |
| Run all sets | `sets("file")` |
| Override parameter | `override("file", 1, { field: "value" })` |
| ETF toggle off | `"enabled": false` in JSON |
| Environment data | `file.qa.json` auto-merged when `ENVIRONMENT=qa` |
| Merge profiles | `merge(["profileA", 1], ["profileB", 1])` |

### Environment Overrides

Create an environment-specific file beside the base data file:

```text
test-data/ui/flightData.json
test-data/ui/flightData.qa.json
```

Example `flightData.qa.json`:

```json
{
  "sets": [
    { "setName": "Set 1", "from": "delhi" }
  ]
}
```

When `ENVIRONMENT=qa`, only the matching fields are overridden. All other fields remain from the base JSON.

---

## 🏛️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Test Layer (Specs)                      │
│     Hotel Booking     Flight + Hotel       REST API         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Page Object Layer (POM)                    │
│  BasePage: auto-heal, smart waits, retry, logging, asserts  │
│  EasyMyTripPage | EasyMyTripPageForFlight | LoginPage       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Utilities Layer                          │
│  autoHeal | set() | Runtime Store | FileUtils | Logger      │
│  ElementUtils | WaitUtils | RetryUtils | ErrorHandler       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│               Configuration & Infrastructure                │
│  Zod env config | Playwright config | API client | Jenkins  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```text
src/
  pages/
    basePage.ts                 Core - all page objects extend this
    easyMyTrip.ts               Hotel booking page object
    easyMyTripForFlight.ts      Flight + hotel page object
    login.ts                    Authentication page object/example

  tests/
    easyMyTrip.spec.ts          Hotel booking UI test
    esaymytripfight.spec.ts     Flight booking tests using Set 1 and Set 2
    users.api.spec.ts           REST API tests

  utils/
    autoHeal.ts                 Runtime DOM recovery engine
    set.ts                      TDP - set() / sets() / override() / merge()
    elementUtils.ts             click / fill / type with retry + heal
    waitUtils.ts                Visibility / load state waits
    retryUtils.ts               Retry helper
    errorHandler.ts             Centralized error handling
    logger.ts                   DEBUG/INFO/PASS/WARN/ERROR/STEP logging
    fileUtils.ts                Excel / CSV / JSON / text helpers
    runtimeStore.ts             In-memory key-value store
    runtimeGlobal.ts            $() get / $$() exists shortcuts
    global-runtime.d.ts         TypeScript declaration for $()

  config/
    env.dev.ts                  DEV environment settings
    env.qa.ts                   QA environment settings
    env.schema.ts               Zod validation schema
    env.index.ts                UI config manager
    config.ts                   API config manager
    globalTimeout.ts            Shared timeout constants
    types.ts                    Config types

  clients/
    apiClient.ts                HTTP client - GET/POST/PUT/PATCH/DELETE

  setup/
    api.setup.ts                Creates APIRequestContext + APIClient

  fixtures/
    fixtures.ts                 basePage fixture
    testFixtures.ts             basePage fixture export
    globalSetup.ts              Global setup hook
    globalTeardown.ts           Global teardown hook

test-data/
  ui/
    flightData.json             Flight sets
    mmt-search-data.json        Legacy/search data
  api/
    sample-payloads.json        API payloads

playwright.config.ts            Playwright configuration
tsconfig.json                   TypeScript + path aliases
package.json                    NPM scripts and dependencies
Jenkinsfile                     CI/CD pipeline
README.md                       Framework documentation
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- Git

### Installation

```bash
npm install
npm run pw:install
```

### Environment Setup

The framework reads environment variables directly from the process. The repo currently contains `.ev`; rename or load it manually if you want dotenv-style behavior.

```env
ENVIRONMENT=qa
HEADLESS=false
API_BASE_URL=https://api.restful-api.dev
API_TIMEOUT=30000
RETRY_ATTEMPTS=1
```

PowerShell:

```powershell
$env:ENVIRONMENT="qa"; npm test
$env:ENVIRONMENT="dev"; $env:HEADLESS="true"; npm test
```

CMD:

```cmd
set ENVIRONMENT=dev && npx playwright test
```

---

## 🧪 Running Tests

```bash
# All tests
npm test

# QA / DEV environment
npm run test:qa
npm run test:dev

# Visible browser
npm run test:qa:headed
npm run test:dev:headed

# Headless
npm run test:qa:headless
npm run test:dev:headless

# Playwright UI mode
npm run test:qa:ui
npm run test:dev:ui

# Debug mode
npm run test:qa:debug
npm run test:dev:debug

# CI mode
npm run test:ci

# Specific files
npx playwright test src/tests/easyMyTrip.spec.ts
npx playwright test src/tests/esaymytripfight.spec.ts
npx playwright test src/tests/users.api.spec.ts

# Specific test
npx playwright test -g "EasyMyTrip Hotel Booking Test"
```

### Playwright Config

| Setting | Local | CI |
|---|---|---|
| Browser project | Chromium | Chromium |
| Workers | 4 | 2 |
| Retries | 0 | 1 |
| Headless | config/env controlled | true |
| Test timeout | 900,000 ms | 900,000 ms |
| Expect timeout | 25,000 ms | 25,000 ms |
| Screenshot | Only on failure | Only on failure |
| Video | Retain on failure | Retain on failure |
| Trace | Retain on failure | Retain on failure |

---

## 📊 Reporting

```bash
npm run report:show
npm run report:allure
npx playwright show-trace test-results/path/trace.zip
```

| Report | Location | Command |
|---|---|---|
| Playwright HTML | `playwright-report/` | `npm run report:show` |
| Allure | `allure-results/` | `npm run report:allure` |
| JUnit XML | `reports/results.xml` | Generated during test run |
| Excel output | `test-results/excel/` | Auto-generated by tests |
| Daily logs | `logs/` | Auto-generated |
| Screenshots/videos/traces | `test-results/` | Generated on failure |

---

## 🧩 Framework Components

### 1️⃣ BasePage — The Framework Engine

All page objects extend `BasePage`. Use BasePage methods so every action gets framework logging, retry, error handling, and auto-heal where supported.

```typescript
export class EasyMyTripPage extends BasePage {
  readonly cityInput = this.getLocator("//input[@id='txtCity']");

  async searchHotel(city: string): Promise<void> {
    await this.click(this.cityInput);
    await this.type(this.cityInput, city);
  }
}
```

Key methods:

```typescript
// Navigation
await this.navigateTo("https://site.com");
await this.goto("/login");

// Element actions
await this.click(locator);
await this.fill(locator, "value");
await this.type(locator, "value");
await this.hover(locator);
await this.selectOption(locator, "value");

// Waits
await this.waitForElementIsVisible(locator);
await this.waitForElementToDisappear(locator);
await this.waitForElementEnabled(locator);

// Queries
const text = await this.getText(locator);
const value = await this.getInputValue(locator);
const count = await this.getElementCount(locator);

// Assertions
await this.assertText(locator, "Expected");
await this.assertURL(/dashboard/);
await this.assertElementVisible(locator);
await this.assertContainsText(locator, "partial");
await this.assertAttributeValue(locator, "href", "/home");

// Runtime store helpers
await this.storeTextContent(this.bookingId, "BOOKING_ID");
await this.storeInputValue(this.cityInput, "CITY");
```

### 2️⃣ set() — TDP Test Data

```typescript
import { set, sets, override, merge } from "@utils/set";

const data = set("flightData", 1);
const dataByName = set("flightData", "Set 2");
const all = sets("flightData");
const changed = override("flightData", 1, { from: "pune" });
const merged = merge(["flightData", 1], ["userProfile", 1]);
```

### 3️⃣ Runtime Store — `$()` / `$$()`

```typescript
Runtime.set("bookingRef", "BK-2026-001");

const ref = $("bookingRef");        // get value
const ok = $$("bookingRef");        // check exists

Runtime.setIfAbsent("city", "Goa");
Runtime.getOrDefault("city", "Goa");
Runtime.getAll();
Runtime.remove("city");
Runtime.clear();
```

### 4️⃣ API Client

```typescript
const response = await api.get("/objects");
const created = await api.post("/objects", {
  name: "Temporary Test Product",
  data: { price: 1000 }
});
const updated = await api.patch(`/objects/${created.data.id}`, {
  name: "Updated Product"
});
const deleted = await api.delete(`/objects/${created.data.id}`);
```

The API response shape is:

```typescript
{
  status: number;
  statusText: string;
  headers: Record<string, any>;
  data: any;
  responseTime: number;
}
```

---

## 📚 Best Practices

### ✅ Use BasePage Methods

```typescript
// Avoid bypassing framework behavior
await this.someLocator.click();
this.page.waitForTimeout(2000);

// Prefer framework wrappers
await this.click(this.someLocator);
await this.pause(2000);
```

### ✅ Use `set()` For Test Data

```typescript
// Avoid hardcoding test data in specs
await flightPage.easyMyTripFlightBookingPage("chennai", "bangalore");

// Prefer JSON data
const data = set("flightData", 1);
await flightPage.easyMyTripFlightBookingPage(data.from, data.to);
```

### ✅ Accept Data In POM Methods

```typescript
async easyMyTripFlightBookingPage(from: string, to: string): Promise<void> {
  // use data from test layer
}

async selectPassengers(adults: number, children: number, travelClass: string): Promise<void> {
  // use data from test layer
}
```

### ✅ Use `override()` For Runtime Values

```typescript
const data = override("flightData", 1, { from: process.env.FROM_CITY });
const dataFromStore = override("flightData", 1, { from: $("selectedCity") });
```

---

## 🔄 CI/CD Integration

The Jenkins-ready setup supports:

- ✅ CI-specific headless execution
- ✅ Reduced CI workers
- ✅ Retry on CI
- ✅ JUnit, HTML, and Allure reports
- ✅ Test artifacts from Playwright

```bash
npm ci
npm run pw:install
npm run test:ci
```

---

## 🔧 Troubleshooting

| Problem | Fix |
|---|---|
| Browsers missing | Run `npm run pw:install` |
| Test failing silently | Add `--headed` or use `npm run test:qa:headed` |
| Need step-by-step debugging | Use `--debug` or `npm run test:qa:debug` |
| Locator not found | Check `[AutoHeal]` logs for suggested selector |
| Strict mode violation | Make locator more specific or intentionally use `.first()` |
| `$("key")` returns undefined | Use `$$("key")` first to check if the key exists |
| `set()` file not found | Create `test-data/ui/fileName.json` |
| Environment override not applied | Create `fileName.qa.json` or `fileName.dev.json` with matching `setName` |
| HTML report not opening | Run `npm run report:show` |
| Allure command missing | Install Allure CLI or use Playwright HTML report |

---

## 📚 Path Aliases

```typescript
import { FileUtils } from "@utils/fileUtils";
import { BasePage } from "@pages/basePage";
import { set } from "@utils/set";
```

| Alias | Maps to |
|---|---|
| `@pages/*` | `src/pages/*` |
| `@utils/*` | `src/utils/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@tests/*` | `src/tests/*` |

---

## 📝 Current Repo Notes

- `esaymytripfight.spec.ts` has a spelling mistake in the filename; use the exact filename when running it.
- `global-runtime.d.ts` declares `$()`. If you want TypeScript support for `$$()`, add a matching declaration.
- The repo currently has `.ev`, not `.env`, and the current config code reads process environment variables directly.
- `hotelData.json`, `hotelData.qa.json`, `userProfile.json`, and `TESTDATA.md` are referenced by the TDP examples, but they are not currently present in this workspace.
- Some scripts in `package.json` still reference old folders like `src/tests/api/` and `src/tests/ui/`; active specs are currently under `src/tests`.
