// ============================================================================
//  set() — Test Data Utility
// ----------------------------------------------------------------------------
//  Simple way to load test data from JSON files.
//
//  USAGE:
//  import { set, sets, override, merge } from "@utils/set";
//
//  const data = set("hotelData", 1);     // Get Set 1
//  const data = set("hotelData", 2);     // Get Set 2
//  const all  = sets("hotelData");       // Get all sets
//  const data = override("hotelData", 1, { city: "Pune" }); // Override field
//  const data = merge(["hotelData",1], ["userProfile",1]);   // Merge two files
// ============================================================================

import * as fs   from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "test-data", "ui");

// Cache loaded files so they are not read from disk on every call
const fileCache = new Map<string, Record<string, unknown>[]>();

// ============================================================================
//  INTERNAL — load sets from JSON file + merge env overrides
// ============================================================================
function loadSets(fileName: string): Record<string, unknown>[] {
  if (fileCache.has(fileName)) return fileCache.get(fileName)!;

  const env      = process.env.ENVIRONMENT || "qa";
  const baseFile = path.join(DATA_DIR, `${fileName}.json`);
  const envFile  = path.join(DATA_DIR, `${fileName}.${env}.json`);

  // Check base file exists
  if (!fs.existsSync(baseFile)) {
    throw new Error(
      `[set] File not found: ${baseFile}\n` +
      `Create the file at: test-data/ui/${fileName}.json`
    );
  }

  // Load base file
  const raw = JSON.parse(fs.readFileSync(baseFile, "utf-8"));
  let loaded: Record<string, unknown>[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.sets) ? raw.sets : [];

  // Merge env-specific overrides if file exists
  // e.g. hotelData.qa.json overrides hotelData.json when ENVIRONMENT=qa
  if (fs.existsSync(envFile)) {
    const envRaw  = JSON.parse(fs.readFileSync(envFile, "utf-8"));
    const envSets: Record<string, unknown>[] = Array.isArray(envRaw)
      ? envRaw
      : Array.isArray(envRaw.sets) ? envRaw.sets : [];

    loaded = loaded.map(base => {
      const envMatch = envSets.find(
        e => String(e.setName).toLowerCase() === String(base.setName).toLowerCase()
      );
      return envMatch ? { ...base, ...envMatch } : base;
    });

    console.log(`[set] Env overrides applied: ${fileName}.${env}.json`);
  }

  // Skip sets where enabled = false (ETF toggle)
  const active = loaded.filter(s => s.enabled !== false);
  fileCache.set(fileName, active);
  return active;
}

// ============================================================================
//  set() — Get one set by index (1-based) or by name
// ----------------------------------------------------------------------------
//  @param fileName  file name without .json  e.g. "hotelData"
//  @param setRef    1-based index OR set name string
//
//  @example
//  const data = set("hotelData", 1);          // Set 1
//  const data = set("hotelData", 2);          // Set 2
//  const data = set("hotelData", "Set 3");    // by name
// ============================================================================
export function set(fileName: string, setRef: number | string): any {
  const allSets = loadSets(fileName);

  if (typeof setRef === "number") {
    if (setRef < 1 || setRef > allSets.length) {
      throw new Error(
        `[set] Index ${setRef} out of range. ` +
        `"${fileName}" has ${allSets.length} set(s).`
      );
    }
    return allSets[setRef - 1];
  }

  const match = allSets.find(
    s => String(s.setName).toLowerCase() === setRef.toLowerCase()
  );

  if (!match) {
    const available = allSets.map(s => s.setName).join(", ");
    throw new Error(
      `[set] "${setRef}" not found in "${fileName}".\n` +
      `Available sets: ${available}`
    );
  }

  return match;
}

// ============================================================================
//  sets() — Get ALL sets as array
// ----------------------------------------------------------------------------
//  Use with test.each to run one test per set automatically.
//
//  @example
//  test.each(sets("hotelData"))("Hotel — $setName", async (data) => {
//    await hotelPage.hotelBookingPage(data.city);
//  });
// ============================================================================
export function sets(fileName: string): any[] {
  return loadSets(fileName);
}

// ============================================================================
//  override() — Get set with one or more fields overridden
// ----------------------------------------------------------------------------
//  @param overrides  plain object with fields to override
//
//  @example
//  const data = override("hotelData", 1, { city: "Pune" });
//  // data.city   = "Pune"  ← overridden
//  // data.adults = 2       ← from JSON Set 1
//
//  // Override with runtime variable
//  const cityFromAPI = await api.getCity();
//  const data = override("hotelData", 1, { city: cityFromAPI });
//
//  // Override multiple fields
//  const data = override("hotelData", 1, { city: "Pune", adults: 3 });
// ============================================================================
export function override(
  fileName:  string,
  setRef:    number | string,
  overrides: Record<string, unknown>
): any {
  const base   = set(fileName, setRef);
  const merged = { ...base, ...overrides };

  console.log(`[set] "${fileName}" Set ${setRef} — overrides:`, overrides);

  return merged;
}

// ============================================================================
//  merge() — Combine fields from multiple JSON files into one object
// ----------------------------------------------------------------------------
//  Useful when one test needs data from multiple profiles.
//
//  @example
//  const data = merge(["hotelData", 1], ["userProfile", 1]);
//  // data.city       ← from hotelData Set 1
//  // data.firstName  ← from userProfile Set 1
//  // data.email      ← from userProfile Set 1
// ============================================================================
export function merge(
  ...sources: Array<[fileName: string, setRef: number | string]>
): any {
  return sources.reduce((acc, [fileName, setRef]) => ({
    ...acc,
    ...set(fileName, setRef),
  }), {});
}