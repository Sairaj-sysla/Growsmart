// src/globalSetup.ts
// ============================================================================
//  GLOBAL SETUP — Runs once before entire test suite
// ============================================================================

import { logger } from "../utils/logger";
import { configManager } from "../config/env.index";

export async function globalSetup() {

  logger.step("Starting Test Suite — Global Setup");

  logger.info(
    `Environment : ${configManager.getEnvironment().toUpperCase()}`
  );

  logger.info(
    `Base URL    : ${configManager.getBaseURL()}`
  );

  logger.info(
    `Browser     : ${process.env.BROWSER || "chromium"}`
  );

  logger.info(
    "Auto-Heal   : Runtime DOM recovery + Playwright smart healing"
  );

  // ==========================================================================
  // ADD YOUR CUSTOM SETUP HERE
  // ==========================================================================
  // Examples:
  // - Database cleanup
  // - API token generation
  // - Mock server startup
  // - Test data seeding
  // - Authentication setup
  // Runtime auto-healing is stateless and requires no setup cleanup.
  // ==========================================================================

  logger.pass("Global Setup complete — tests starting");

  // ==========================================================================
  // GLOBAL TEARDOWN
  // ==========================================================================
  return async () => {

    logger.step("Test Suite Complete — Global Teardown");

    // ========================================================================
    // ADD YOUR CUSTOM TEARDOWN HERE
    // ========================================================================
    // Examples:
    // - Database cleanup
    // - Mock server shutdown
    // - Report upload
    // ========================================================================

    logger.pass("Global Teardown complete");
  };
}

export default globalSetup;
