// ============================================================================
// LOGGER (Merged Enterprise Edition)
// ----------------------------------------------------------------------------
// - Supports: DEBUG, INFO, WARN, ERROR, PASS, FAIL, STEP
// - Auto-creates logs/ directory
// - Daily log rotation → logs/api-test-YYYY-MM-DD.log
// - Color-coded console output
// - Singleton instance (Logger.getInstance())
// - Supports LOG_LEVEL filtering (INFO, WARN, ERROR etc.)
// ============================================================================

import * as fs from "fs";
import * as path from "path";

// ----------------------------------------------------------------------------
// LOG LEVEL ENUM
// ----------------------------------------------------------------------------
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO  = "INFO",
  WARN  = "WARN",
  ERROR = "ERROR",
  PASS  = "PASS",
  FAIL  = "FAIL",
  STEP  = "STEP",   // ← high-level test step marker
}

// ----------------------------------------------------------------------------
// TERMINAL COLORS
// ----------------------------------------------------------------------------
const COLORS: Record<string, string> = {
  DEBUG: "\x1b[90m", // grey
  INFO:  "\x1b[36m", // cyan
  WARN:  "\x1b[33m", // yellow
  ERROR: "\x1b[31m", // red
  PASS:  "\x1b[32m", // green
  FAIL:  "\x1b[31m", // red
  STEP:  "\x1b[35m", // magenta — stands out from INFO
  RESET: "\x1b[0m",
};

// ============================================================================
// LOGGER CLASS
// ============================================================================
export class Logger {
  private static instance: Logger;
  private readonly logDir: string = "logs";
  private readonly logFile: string;
  private readonly currentLevel: LogLevel;

  private constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const today = new Date().toISOString().split("T")[0];
    this.logFile = path.join(this.logDir, `api-test-${today}.log`);

    const envLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel;
    this.currentLevel = LogLevel[envLevel] ? envLevel : LogLevel.DEBUG;
  }

  // --------------------------------------------------------------------------
  // Singleton
  // --------------------------------------------------------------------------
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // --------------------------------------------------------------------------
  // Log level priority filter
  // --------------------------------------------------------------------------
  private shouldLog(level: LogLevel): boolean {
    const priority: Record<LogLevel, number> = {
      [LogLevel.ERROR]: 0,
      [LogLevel.FAIL]:  1,
      [LogLevel.WARN]:  2,
      [LogLevel.STEP]:  3,
      [LogLevel.INFO]:  3,
      [LogLevel.PASS]:  4,
      [LogLevel.DEBUG]: 5,
    };
    return priority[level] <= priority[this.currentLevel];
  }

  // --------------------------------------------------------------------------
  // Format
  // --------------------------------------------------------------------------
  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const details = data ? `\n${JSON.stringify(data, null, 2)}` : "";
    return `[${timestamp}] [${level}] ${message}${details}`;
  }

  // --------------------------------------------------------------------------
  // Output to console + file
  // --------------------------------------------------------------------------
  private output(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const formatted = this.format(level, message, data);
    const color = COLORS[level] || "";
    console.log(color + formatted + COLORS.RESET);
    fs.appendFile(this.logFile, formatted + "\n", () => {});
  }

  // --------------------------------------------------------------------------
  // Public log methods
  // --------------------------------------------------------------------------
  debug(msg: string, data?: any) { this.output(LogLevel.DEBUG, msg, data); }
  info(msg: string, data?: any)  { this.output(LogLevel.INFO,  msg, data); }
  warn(msg: string, data?: any)  { this.output(LogLevel.WARN,  msg, data); }
  error(msg: string, data?: any) { this.output(LogLevel.ERROR, msg, data); }
  pass(msg: string, data?: any)  { this.output(LogLevel.PASS,  msg, data); }
  fail(msg: string, data?: any)  { this.output(LogLevel.FAIL,  msg, data); }

  /**
   * step — high-level test action marker.
   * Use for top-level actions like "Navigate To", "Click Login", etc.
   * Shows in magenta so it's easy to spot in the log stream.
   *
   * @example
   * logger.step("Navigate To → https://app.example.com");
   * logger.step("Click → Login Button");
   */
  step(msg: string, data?: any) { this.output(LogLevel.STEP, `▶ ${msg}`, data); }

  getLogFile(): string {
    return this.logFile;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export const logger = Logger.getInstance();