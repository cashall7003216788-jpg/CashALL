/**
 * ──────────────────────────────────────────────────────────────────────────────
 * CashALL Laptop Specs Database
 * ──────────────────────────────────────────────────────────────────────────────
 * Maps brand + model slugs → exact processor / RAM / storage options the laptop
 * ships with, plus defaults (most common variant) and stylus flag.
 *
 * Used by the laptop assessment Step 2 dropdowns so customers only see
 * options relevant to their actual device.
 * ──────────────────────────────────────────────────────────────────────────────
 */

export interface LaptopSpecConfig {
  processors: string[];
  rams: string[];
  storages: string[];
  defaultProcessor: string;
  defaultRam: string;
  defaultStorage: string;
  /** true if this model ships with a built-in stylus / pen in the box */
  hasStylus: boolean;
}

// ─── Common Option Sets (reused across multiple models) ───────────────────────

const APPLE_M_SERIES = ["Apple M1", "Apple M1 Pro / Max", "Apple M2", "Apple M2 Pro / Max", "Apple M3", "Apple M3 Pro / Max", "Apple M4"];
const APPLE_INTEL_OLD = ["Intel Core i5", "Intel Core i7"];
const APPLE_INTEL_OLDER = ["Intel Core i3", "Intel Core i5", "Intel Core i7"];
const APPLE_RAM_MODERN = ["8 GB", "16 GB", "24 GB", "32 GB", "36 GB", "48 GB", "64 GB", "96 GB", "128 GB"];
const APPLE_RAM_INTEL = ["8 GB", "16 GB", "32 GB"];
const APPLE_RAM_INTEL_OLD = ["4 GB", "8 GB", "16 GB"];
const APPLE_SSD_MODERN = ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD", "4 TB SSD", "8 TB SSD"];
const APPLE_SSD_OLD = ["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD"];

const DELL_INTEL_CONSUMER = ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9"];
const DELL_INTEL_ULTRA = ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9"];
const DELL_AMD = ["AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const DELL_INTEL_AMD = [...DELL_INTEL_CONSUMER, ...DELL_AMD];
const DELL_RAM_STD = ["8 GB", "16 GB", "32 GB"];
const DELL_RAM_FULL = ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"];
const DELL_SSD_STD = ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"];
const DELL_HDD_STD = ["1 TB HDD", "500 GB HDD", "256 GB SSD + 1 TB HDD", "512 GB SSD + 1 TB HDD"];
const DELL_STORAGE_MIX = [...DELL_SSD_STD, ...DELL_HDD_STD];

const HP_INTEL_STD = ["Intel Core i3", "Intel Core i5", "Intel Core i7"];
const HP_INTEL_ULTRA = ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"];
const HP_AMD = ["AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7"];
const HP_INTEL_AMD = [...HP_INTEL_STD, ...HP_AMD];
const HP_RAM_STD = ["8 GB", "16 GB", "32 GB"];
const HP_RAM_FULL = ["4 GB", "8 GB", "16 GB", "32 GB"];
const HP_SSD_STD = ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"];
const HP_STORAGE_MIX = [...HP_SSD_STD, "1 TB HDD", "256 GB SSD + 1 TB HDD"];

const LENOVO_INTEL_STD = ["Intel Core i3", "Intel Core i5", "Intel Core i7"];
const LENOVO_INTEL_ULTRA = ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"];
const LENOVO_AMD = ["AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const LENOVO_INTEL_AMD = [...LENOVO_INTEL_STD, ...LENOVO_AMD];
const LENOVO_RAM_STD = ["8 GB", "16 GB", "32 GB"];
const LENOVO_RAM_FULL = ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"];
const LENOVO_SSD_STD = ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"];
const LENOVO_STORAGE_MIX = [...LENOVO_SSD_STD, "1 TB HDD", "256 GB SSD + 1 TB HDD"];

const ASUS_INTEL_STD = ["Intel Core i3", "Intel Core i5", "Intel Core i7"];
const ASUS_AMD = ["AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const ASUS_INTEL_AMD = [...ASUS_INTEL_STD, ...ASUS_AMD];
const ASUS_RAM_STD = ["8 GB", "16 GB", "32 GB"];
const ASUS_SSD_STD = ["256 GB SSD", "512 GB SSD", "1 TB SSD"];
const ASUS_STORAGE_MIX = [...ASUS_SSD_STD, "1 TB HDD", "256 GB SSD + 1 TB HDD"];

const ACER_INTEL_STD = ["Intel Core i3", "Intel Core i5", "Intel Core i7"];
const ACER_AMD = ["AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const ACER_INTEL_AMD = [...ACER_INTEL_STD, ...ACER_AMD];
const ACER_RAM_STD = ["8 GB", "16 GB", "32 GB"];
const ACER_SSD_STD = ["256 GB SSD", "512 GB SSD", "1 TB SSD"];
const ACER_STORAGE_MIX = [...ACER_SSD_STD, "1 TB HDD", "256 GB SSD + 1 TB HDD"];

const GAMING_INTEL = ["Intel Core i5", "Intel Core i7", "Intel Core i9", "Intel Core Ultra 5", "Intel Core Ultra 7", "Intel Core Ultra 9"];
const GAMING_AMD = ["AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"];
const GAMING_INTEL_AMD = [...GAMING_INTEL, ...GAMING_AMD];
const GAMING_RAM = ["8 GB", "16 GB", "32 GB", "64 GB"];
const GAMING_SSD = ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD", "512 GB SSD + 1 TB HDD", "1 TB SSD + 1 TB HDD"];

const SURFACE_INTEL = ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"];
const SURFACE_RAM = ["8 GB", "16 GB", "32 GB", "64 GB"];
const SURFACE_SSD = ["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"];

// ─── Brand-Level Fallbacks ────────────────────────────────────────────────────

const BRAND_FALLBACKS: Record<string, LaptopSpecConfig> = {
  apple: {
    processors: [...APPLE_M_SERIES, ...APPLE_INTEL_OLD],
    rams: APPLE_RAM_MODERN,
    storages: APPLE_SSD_MODERN,
    defaultProcessor: "Apple M2",
    defaultRam: "8 GB",
    defaultStorage: "256 GB SSD",
    hasStylus: false,
  },
  dell: {
    processors: [...DELL_INTEL_ULTRA, ...DELL_AMD],
    rams: DELL_RAM_FULL,
    storages: DELL_STORAGE_MIX,
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  },
  hp: {
    processors: [...HP_INTEL_ULTRA, ...HP_AMD],
    rams: HP_RAM_FULL,
    storages: HP_STORAGE_MIX,
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  },
  lenovo: {
    processors: [...LENOVO_INTEL_ULTRA, ...LENOVO_AMD],
    rams: LENOVO_RAM_FULL,
    storages: LENOVO_STORAGE_MIX,
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  },
  asus: {
    processors: [...ASUS_INTEL_STD, "Intel Core i9", ...ASUS_AMD],
    rams: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"],
    storages: ASUS_STORAGE_MIX,
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  },
  acer: {
    processors: [...ACER_INTEL_STD, "Intel Core i9", ...ACER_AMD],
    rams: ["4 GB", "8 GB", "16 GB", "32 GB"],
    storages: ACER_STORAGE_MIX,
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  },
  microsoft: {
    processors: SURFACE_INTEL,
    rams: SURFACE_RAM,
    storages: SURFACE_SSD,
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "256 GB SSD",
    hasStylus: true,
  },
  samsung: {
    processors: ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"],
    rams: ["8 GB", "16 GB", "32 GB"],
    storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD"],
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  },
};

// ─── Model-Specific Rules ─────────────────────────────────────────────────────
// Key: partial slug pattern (lowercase) → LaptopSpecConfig
// Patterns are tested in order; first match wins.

type ModelSpecRule = { pattern: string | RegExp; spec: LaptopSpecConfig };

const MODEL_SPEC_RULES: ModelSpecRule[] = [
  // ── APPLE MacBook Air (modern M-series) ──────────────────────────────────────
  {
    pattern: /macbook-air-(2022|2023|2024|2025|2026)/,
    spec: {
      processors: ["Apple M2", "Apple M3", "Apple M4"],
      rams: ["8 GB", "16 GB", "24 GB", "32 GB"],
      storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"],
      defaultProcessor: "Apple M2",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /macbook-air-(2020)/,
    spec: {
      processors: ["Apple M1", "Intel Core i3", "Intel Core i5", "Intel Core i7"],
      rams: ["8 GB", "16 GB"],
      storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"],
      defaultProcessor: "Apple M1",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /macbook-air-(2018|2019)/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7"],
      rams: ["8 GB", "16 GB"],
      storages: APPLE_SSD_OLD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /macbook-air-(mid-2017|early-201[34567]|mid-201[34567]|late-201[234])/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7"],
      rams: ["4 GB", "8 GB"],
      storages: ["128 GB SSD", "256 GB SSD", "512 GB SSD"],
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "128 GB SSD",
      hasStylus: false,
    },
  },

  // ── APPLE MacBook Pro (modern M-series) ──────────────────────────────────────
  {
    pattern: /macbook-pro-(2021|2022|2023|2024|2025)/,
    spec: {
      processors: ["Apple M1 Pro / Max", "Apple M2 Pro / Max", "Apple M3 Pro / Max", "Apple M4"],
      rams: ["16 GB", "32 GB", "36 GB", "48 GB", "64 GB", "96 GB", "128 GB", "192 GB"],
      storages: ["512 GB SSD", "1 TB SSD", "2 TB SSD", "4 TB SSD", "8 TB SSD"],
      defaultProcessor: "Apple M2 Pro / Max",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /macbook-pro-2020/,
    spec: {
      processors: ["Apple M1", "Intel Core i5", "Intel Core i7"],
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: APPLE_SSD_MODERN,
      defaultProcessor: "Apple M1",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /macbook-pro-(2016|2017|2018|2019)/,
    spec: {
      processors: APPLE_INTEL_OLD,
      rams: APPLE_RAM_INTEL,
      storages: APPLE_SSD_OLD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /macbook-pro-retina/,
    spec: {
      processors: APPLE_INTEL_OLD,
      rams: APPLE_RAM_INTEL_OLD,
      storages: APPLE_SSD_OLD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: "macbook-neo",
    spec: {
      processors: ["Apple M4", "Apple M4 Pro / Max"],
      rams: ["16 GB", "24 GB", "32 GB", "48 GB", "64 GB"],
      storages: APPLE_SSD_MODERN,
      defaultProcessor: "Apple M4",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },

  // ── DELL XPS ─────────────────────────────────────────────────────────────────
  {
    pattern: /xps-13/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"],
      rams: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storages: ["512 GB SSD", "1 TB SSD", "2 TB SSD"],
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /xps-15/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7", "Intel Core i9", "Intel Core Ultra 7", "Intel Core Ultra 9"],
      rams: ["16 GB", "32 GB", "64 GB"],
      storages: ["512 GB SSD", "1 TB SSD", "2 TB SSD", "4 TB SSD"],
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /xps-17/,
    spec: {
      processors: ["Intel Core i7", "Intel Core i9", "Intel Core Ultra 7", "Intel Core Ultra 9"],
      rams: ["16 GB", "32 GB", "64 GB"],
      storages: ["512 GB SSD", "1 TB SSD", "2 TB SSD", "4 TB SSD"],
      defaultProcessor: "Intel Core i9",
      defaultRam: "32 GB",
      defaultStorage: "1 TB SSD",
      hasStylus: false,
    },
  },
  // DELL Inspiron
  {
    pattern: /inspiron-14/,
    spec: {
      processors: DELL_INTEL_AMD,
      rams: DELL_RAM_FULL,
      storages: DELL_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /inspiron-15/,
    spec: {
      processors: DELL_INTEL_AMD,
      rams: DELL_RAM_FULL,
      storages: DELL_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /inspiron-16/,
    spec: {
      processors: [...DELL_INTEL_CONSUMER, "AMD Ryzen 5", "AMD Ryzen 7"],
      rams: DELL_RAM_STD,
      storages: DELL_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // DELL Latitude
  {
    pattern: /latitude/,
    spec: {
      processors: DELL_INTEL_ULTRA,
      rams: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storages: DELL_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  // DELL Vostro
  {
    pattern: /vostro/,
    spec: {
      processors: DELL_INTEL_AMD,
      rams: DELL_RAM_FULL,
      storages: DELL_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // DELL Alienware (gaming)
  {
    pattern: /alienware/,
    spec: {
      processors: GAMING_INTEL,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // DELL G-Series Gaming
  {
    pattern: /dell-g[0-9]/,
    spec: {
      processors: GAMING_INTEL_AMD,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },

  // ── HP Spectre x360 (stylus!) ─────────────────────────────────────────────
  {
    pattern: /spectre/,
    spec: {
      processors: HP_INTEL_ULTRA,
      rams: ["16 GB", "32 GB", "64 GB"],
      storages: ["512 GB SSD", "1 TB SSD", "2 TB SSD"],
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: true,
    },
  },
  // HP Envy
  {
    pattern: /envy/,
    spec: {
      processors: HP_INTEL_ULTRA,
      rams: HP_RAM_STD,
      storages: HP_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // HP Pavilion
  {
    pattern: /pavilion/,
    spec: {
      processors: HP_INTEL_AMD,
      rams: HP_RAM_FULL,
      storages: HP_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // HP EliteBook
  {
    pattern: /elitebook/,
    spec: {
      processors: HP_INTEL_ULTRA,
      rams: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storages: HP_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // HP ProBook
  {
    pattern: /probook/,
    spec: {
      processors: HP_INTEL_STD,
      rams: HP_RAM_FULL,
      storages: HP_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  // HP Victus / Omen (gaming)
  {
    pattern: /victus|hp-omen/,
    spec: {
      processors: GAMING_INTEL_AMD,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },

  // ── LENOVO ThinkPad (business) ───────────────────────────────────────────────
  {
    pattern: /thinkpad-x1/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"],
      rams: ["16 GB", "32 GB", "64 GB"],
      storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD"],
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /thinkpad-e14|thinkpad-e15|thinkpad-e16/,
    spec: {
      processors: LENOVO_INTEL_AMD,
      rams: LENOVO_RAM_FULL,
      storages: LENOVO_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /thinkpad/,
    spec: {
      processors: LENOVO_INTEL_ULTRA,
      rams: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storages: LENOVO_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // LENOVO Yoga (stylus — built-in Active Pen on 2-in-1 models)
  {
    pattern: /yoga/,
    spec: {
      processors: LENOVO_INTEL_AMD,
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: LENOVO_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: true,
    },
  },
  // LENOVO IdeaPad
  {
    pattern: /ideapad/,
    spec: {
      processors: LENOVO_INTEL_AMD,
      rams: LENOVO_RAM_FULL,
      storages: LENOVO_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // LENOVO Legion (gaming)
  {
    pattern: /legion/,
    spec: {
      processors: GAMING_INTEL_AMD,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },

  // ── ASUS ZenBook ─────────────────────────────────────────────────────────────
  {
    pattern: /zenbook/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"],
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: ASUS_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // ASUS VivoBook
  {
    pattern: /vivobook/,
    spec: {
      processors: ASUS_INTEL_AMD,
      rams: ["4 GB", "8 GB", "16 GB", "32 GB"],
      storages: ASUS_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // ASUS ROG / TUF Gaming
  {
    pattern: /rog|tuf-gaming/,
    spec: {
      processors: GAMING_INTEL_AMD,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "AMD Ryzen 7",
      defaultRam: "16 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  // ASUS X / K / R / Other series
  {
    pattern: /asus-x-series|asus-k-series|asus-r-series/,
    spec: {
      processors: ASUS_INTEL_AMD,
      rams: ["4 GB", "8 GB", "16 GB"],
      storages: ["250 GB HDD", "500 GB HDD", "1 TB HDD", "256 GB SSD", "512 GB SSD", "1 TB SSD"],
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "1 TB HDD",
      hasStylus: false,
    },
  },

  // ── ACER Aspire / Swift / Nitro / Predator ───────────────────────────────────
  {
    pattern: /aspire/,
    spec: {
      processors: ACER_INTEL_AMD,
      rams: ["4 GB", "8 GB", "16 GB", "32 GB"],
      storages: ACER_STORAGE_MIX,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /swift/,
    spec: {
      processors: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core Ultra 5"],
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: ACER_SSD_STD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /nitro/,
    spec: {
      processors: GAMING_INTEL_AMD,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /predator/,
    spec: {
      processors: GAMING_INTEL_AMD,
      rams: GAMING_RAM,
      storages: GAMING_SSD,
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "1 TB SSD",
      hasStylus: false,
    },
  },

  // ── MICROSOFT Surface ─────────────────────────────────────────────────────────
  {
    pattern: /surface-pro/,
    spec: {
      processors: SURFACE_INTEL,
      rams: SURFACE_RAM,
      storages: SURFACE_SSD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: true,  // Surface Pro ships with Surface Pen sold separately, but it's the main accessory
    },
  },
  {
    pattern: /surface-laptop/,
    spec: {
      processors: SURFACE_INTEL,
      rams: ["8 GB", "16 GB", "32 GB", "64 GB"],
      storages: SURFACE_SSD,
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: false,
    },
  },
  {
    pattern: /surface-book/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7"],
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: SURFACE_SSD,
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "256 GB SSD",
      hasStylus: true,  // Surface Book ships with Surface Pen
    },
  },
  {
    pattern: /surface-studio/,
    spec: {
      processors: ["Intel Core i7", "Intel Core Ultra 7"],
      rams: ["16 GB", "32 GB", "64 GB"],
      storages: ["1 TB SSD", "2 TB SSD"],
      defaultProcessor: "Intel Core i7",
      defaultRam: "16 GB",
      defaultStorage: "1 TB SSD",
      hasStylus: true,
    },
  },

  // ── SAMSUNG Galaxy Book ───────────────────────────────────────────────────────
  {
    pattern: /galaxy-book-2-pro-360|galaxy-book-3-pro-360|galaxy-book-4-pro-360/,
    spec: {
      processors: ["Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"],
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD"],
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: true,  // 360° 2-in-1 Galaxy Books ship with S Pen
    },
  },
  {
    pattern: /galaxy-book/,
    spec: {
      processors: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core Ultra 5", "Intel Core Ultra 7"],
      rams: ["8 GB", "16 GB", "32 GB"],
      storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD"],
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },

  // ── Catch-alls for old/other series ──────────────────────────────────────────
  {
    pattern: /d-series|e-series|r-series|a-series|b-series|c-series|m-series|t-series|s-series|p-series/,
    spec: {
      processors: [...LENOVO_INTEL_STD, ...LENOVO_AMD],
      rams: ["4 GB", "8 GB", "16 GB", "32 GB"],
      storages: ["256 GB SSD", "512 GB SSD", "1 TB SSD", "1 TB HDD", "500 GB HDD"],
      defaultProcessor: "Intel Core i5",
      defaultRam: "8 GB",
      defaultStorage: "512 GB SSD",
      hasStylus: false,
    },
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get model-specific spec options for the laptop assessment Step 2 dropdown.
 *
 * Resolution order:
 *  1. MODEL_SPEC_RULES — match on modelSlug using string prefix or regex
 *  2. BRAND_FALLBACKS  — match on brandSlug
 *  3. Generic fallback — Intel i3–i9 + all RAMs + all storages
 */
export function getLaptopSpecs(brandSlug: string, modelSlug: string): LaptopSpecConfig {
  const bs = (brandSlug || "").toLowerCase().trim();
  const ms = (modelSlug || "").toLowerCase().trim();

  // 1. Try model-specific rules first
  for (const rule of MODEL_SPEC_RULES) {
    const matches =
      typeof rule.pattern === "string"
        ? ms.includes(rule.pattern)
        : rule.pattern.test(ms);
    if (matches) {
      return rule.spec;
    }
  }

  // 2. Try brand-level fallback
  for (const [key, spec] of Object.entries(BRAND_FALLBACKS)) {
    if (bs.includes(key)) return spec;
  }

  // 3. Generic fallback — works for any unrecognized laptop
  return {
    processors: [
      "Intel Core i3",
      "Intel Core i5",
      "Intel Core i7",
      "Intel Core i9",
      "Intel Core Ultra 5",
      "Intel Core Ultra 7",
      "AMD Ryzen 3",
      "AMD Ryzen 5",
      "AMD Ryzen 7",
      "AMD Ryzen 9",
      "Intel Pentium / Celeron",
      "Intel Core 2 Duo",
      "AMD Athlon",
      "Other Dual Core",
    ],
    rams: ["2 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB", "32 GB", "64 GB"],
    storages: [
      "120 GB HDD", "250 GB HDD", "320 GB HDD", "500 GB HDD", "1 TB HDD",
      "64 GB SSD", "128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "2 TB SSD",
      "256 GB SSD + 1 TB HDD", "512 GB SSD + 1 TB HDD",
    ],
    defaultProcessor: "Intel Core i5",
    defaultRam: "8 GB",
    defaultStorage: "512 GB SSD",
    hasStylus: false,
  };
}

// ─── Tablet Stylus Lookup ─────────────────────────────────────────────────────

/**
 * Tablets that INCLUDE a stylus/S Pen/Apple Pencil in the retail box
 * (or it's the primary value accessory for that tablet).
 *
 * iPad Pro & iPad Air 4th gen+  → Apple Pencil (included in bundle or strongly expected)
 * Samsung Galaxy Tab S-series   → S Pen included in the box
 * Samsung Galaxy Tab S6 Lite    → S Pen included
 * OnePlus Pad / Pad 2           → OnePlus Stylo (sold separately — NOT included, skip)
 */
const STYLUS_TABLET_SLUG_PATTERNS: (string | RegExp)[] = [
  // Apple iPad Pro (all generations)
  /ipad-pro/,
  // Apple iPad Air 4th gen and later
  /ipad-air-(4th|5th|6th|7th|8th|9th|10th|11th)/,
  // Samsung Galaxy Tab S series (S6 and above ship with S Pen in box)
  /galaxy-tab-s[6789]/,
  /galaxy-tab-s1[0-9]/,
  // Samsung Galaxy Tab S6 Lite
  "galaxy-tab-s6-lite",
  // Microsoft Surface Pro (stylus is the primary accessory)
  /surface-pro/,
];

/**
 * Returns true if the given tablet model slug includes a stylus in the box.
 */
export function tabletHasStylus(modelSlug: string): boolean {
  const ms = (modelSlug || "").toLowerCase().trim();
  for (const pattern of STYLUS_TABLET_SLUG_PATTERNS) {
    const matches =
      typeof pattern === "string"
        ? ms.includes(pattern)
        : pattern.test(ms);
    if (matches) return true;
  }
  return false;
}
