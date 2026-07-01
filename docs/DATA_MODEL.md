# StayWave Maldives — Data Model

This document describes every JSON configuration file under `assets/data/` and explains how to update packages, prices, promotions, and related content without editing JavaScript.

---

## Table of Contents

1. [Overview](#overview)
2. [How data flows](#how-data-flows)
3. [File reference](#file-reference)
   - [packages.json](#packagesjson)
   - [accommodation.json](#accommodationjson)
   - [mealplans.json](#mealplansjson)
   - [transport.json](#transportjson)
   - [equipment.json](#equipmentjson)
   - [experiences.json](#experiencesjson)
   - [discounts.json](#discountsjson)
   - [promocodes.json](#promoCodesjson)
   - [settings.json](#settingsjson)
   - [currencies.json](#currenciesjson)
   - [marine-life.json](#marine-lifejson)
   - [testimonials.json](#testimonialsjson)
   - [company.json](#companyjson)
4. [ID conventions](#id-conventions)
5. [Relationship map](#relationship-map)
6. [Common tasks](#common-tasks)
7. [Future-ready features](#future-ready-features)

---

## Overview

All booking and business data is stored in structured JSON files under `assets/data/`. The JavaScript layer reads these files at runtime via `DataLoader` (`assets/scripts/data/dataLoader.js`) and never hardcodes prices or catalogue data.

Benefits:
- Prices, packages, and promo codes can be updated without touching any JavaScript.
- The same data model supports seasonal pricing, multiple currencies, and multilingual content today, ready for future activation.
- Replacing JSON files with a CMS or database API requires changes only in `dataLoader.js`, not in any page scripts.

---

## How data flows

```
assets/data/*.json
        │
        ▼
assets/scripts/data/dataLoader.js   ← fetch, validate, fallback
        │
        ▼
assets/scripts/dive-packages-calculator.js   ← business logic, UI rendering
```

`DataLoader.load()` is called once per page load. It fetches all JSON files in parallel, validates each one, and returns a single config object. If any file is missing or corrupt, that section falls back to safe built-in defaults printed in the console so developers can diagnose the issue without breaking the page for visitors.

---

## File reference

### packages.json

**Path:** `assets/data/packages.json`

Defines the available dive packages. Each package has a `seasonalPricing` map containing one or more season keys. The key `"default"` is always used unless a specific season is activated via `DataLoader.load({ season: 'peak-2026' })`.

**Schema:**

```json
{
  "packages": [
    {
      "id": "string",              // Unique identifier; used as radio input value in the booking form
      "name": "string",            // Display name (English default)
      "nights": "number",          // Duration in nights
      "dives": "number",           // Number of included guided dives
      "seasonalPricing": {
        "default": {               // Season key — "default" is always active
          "label": "string",       // Human-readable season label
          "tiers": [
            {
              "tierId": "string",  // Unique tier identifier within this package
              "label": "string",   // Display label, e.g. "1 Diver"
              "minDivers": "number",// Minimum diver count for this tier to apply
              "pricePerDiver": "number" // USD price per diver for this tier
            }
          ]
        }
      },
      "i18n": {
        "en": { "name": "string" } // Localised names; add keys like "fr", "de" as needed
      }
    }
  ]
}
```

**Example — adding a new package:**

```json
{
  "id": "10n20d",
  "name": "10 Nights • 20 Dives",
  "nights": 10,
  "dives": 20,
  "seasonalPricing": {
    "default": {
      "label": "Standard",
      "tiers": [
        { "tierId": "tier1", "label": "1 Diver", "minDivers": 1, "pricePerDiver": 2400 }
      ]
    }
  },
  "i18n": { "en": { "name": "10 Nights • 20 Dives" } }
}
```

**Example — adding a peak season:**

```json
"seasonalPricing": {
  "default": { ... },
  "peak-2026": {
    "label": "Peak Season 2026",
    "tiers": [
      { "tierId": "tier1", "label": "1 Diver", "minDivers": 1, "pricePerDiver": 950 }
    ]
  }
}
```

Activate with: `DataLoader.load({ season: 'peak-2026' })`.

---

### accommodation.json

**Path:** `assets/data/accommodation.json`

Defines accommodation categories. `nightlyPerRoom` is in USD and is charged per room per night; room count is derived from guest count and `settings.booking.occupancyPerRoom`.

**Schema:**

```json
{
  "accommodations": [
    {
      "id": "string",              // Matches the radio input value in the booking form
      "name": "string",            // Display name
      "nightlyPerRoom": "number",  // USD per room per night
      "i18n": { "en": { "name": "string" } }
    }
  ]
}
```

> **Note:** The first accommodation in the array is treated as the "basic" baseline for calculating upgrade costs.

---

### mealplans.json

**Path:** `assets/data/mealplans.json`

Meal plan options available to all guests. `perPersonPerNight` is in USD.

**Schema:**

```json
{
  "plans": [
    {
      "id": "string",              // Matches the <option> value in the meal-plan select
      "name": "string",
      "perPersonPerNight": "number", // 0 for room-only
      "i18n": { "en": { "name": "string" } }
    }
  ]
}
```

---

### transport.json

**Path:** `assets/data/transport.json`

Transport add-ons (e.g. domestic flights). See [Add-on pricing models](#add-on-pricing-models) for `pricingModel` values.

**Schema:**

```json
{
  "transport": [
    {
      "id": "string",
      "name": "string",
      "category": "string",         // Display category heading in the add-ons section
      "price": "number",            // USD base price
      "pricingModel": "string",     // See pricing models below
      "appliesTo": ["diver", "nonDiver"],
      "i18n": { "en": { "name": "string" } }
    }
  ]
}
```

---

### equipment.json

**Path:** `assets/data/equipment.json`

Diving equipment add-ons (available to divers only).

**Schema:** Same as `transport.json` but the array key is `equipment` and `appliesTo` should always include `"diver"`.

---

### experiences.json

**Path:** `assets/data/experiences.json`

Non-diving experience add-ons available to all guests.

**Schema:** Same as `transport.json` but the array key is `experiences`.

#### Add-on pricing models

| `pricingModel`   | Calculation                                   |
|------------------|-----------------------------------------------|
| `per_person_trip`| `price × (divers + nonDivers)`                |
| `per_diver_trip` | `price × divers`                              |
| `per_diver_unit` | `price × divers` (typically consumables)      |
| `flat_trip`      | `price` (fixed fee regardless of group size)  |

---

### discounts.json

**Path:** `assets/data/discounts.json`

Reserved for threshold-based or category discounts not tied to a specific package. Group pricing discounts are embedded in each package's `seasonalPricing.tiers` (see [packages.json](#packagesjson)).

**Schema:**

```json
{
  "automaticDiscounts": []  // Add future auto-applied discounts here
}
```

---

### promocodes.json

**Path:** `assets/data/promocodes.json`

Promotional offer codes entered by guests in the booking form.

**Schema:**

```json
{
  "codes": [
    {
      "id": "string",              // The code guests enter (uppercase, no spaces)
      "type": "percentage|fixed",  // Discount type
      "value": "number",           // Fraction for percentage (0.1 = 10%) or USD for fixed
      "expiresOn": "YYYY-MM-DD",   // Expiry date (inclusive)
      "minBookingValue": "number", // Minimum USD subtotal required
      "minDivers": "number",       // Minimum diver count required
      "groupOnly": "boolean"       // If true, requires divers >= 2
    }
  ]
}
```

**Example — adding a new code:**

```json
{
  "id": "SUMMER2026",
  "type": "percentage",
  "value": 0.15,
  "expiresOn": "2026-08-31",
  "minBookingValue": 1500,
  "minDivers": 1,
  "groupOnly": false
}
```

---

### settings.json

**Path:** `assets/data/settings.json`

Global booking settings and feature flags. No code changes needed to enable/disable tax or adjust deposit percentage.

**Schema:**

```json
{
  "booking": {
    "defaultCurrency": "string",   // ISO 4217 currency code; must exist in currencies.json
    "occupancyPerRoom": "number",  // Guests per room for room-count calculation
    "depositPercentage": "number", // Fraction of total due as advance deposit (0.3 = 30%)
    "whatsappNumber": "string"     // International number without + or spaces
  },
  "tax": {
    "enabled": "boolean",
    "rate": "number",              // Fraction (0.16 = 16%)
    "label": "string"
  },
  "serviceCharge": {
    "enabled": "boolean",
    "rate": "number",
    "label": "string"
  },
  "nonDiver": {
    "perPersonPerNight": "number"  // USD charge per non-diver per night (covers added costs)
  }
}
```

**To enable tax:** Set `"enabled": true` and confirm `rate` and `label` are correct. The tax is applied to the post-promo subtotal.

---

### currencies.json

**Path:** `assets/data/currencies.json`

Supported display currencies. All internal prices are stored in USD; conversion is applied at display time only.

**Schema:**

```json
{
  "default": "string",      // ISO 4217 code of the default display currency
  "currencies": [
    {
      "code": "string",     // ISO 4217 code, e.g. "USD"
      "label": "string",    // Human-readable name
      "symbol": "string",   // Currency symbol
      "locale": "string",   // BCP 47 locale for Intl.NumberFormat
      "rateFromUsd": "number" // Multiplier: 1 USD × rateFromUsd = amount in this currency
    }
  ]
}
```

**To add a currency:**

1. Append a new object to the `currencies` array.
2. Set `rateFromUsd` to the current exchange rate.
3. Optionally update `"default"` to make the new currency the default.
4. Add a `<option>` in the currency `<select>` in the booking form HTML.

**Important:** Exchange rates are static. For live rates, replace `rateFromUsd` values with an API call inside `dataLoader.js`.

---

### marine-life.json

**Path:** `assets/data/marine-life.json`

Marine species encountered at Fuvahmulah dive sites. Intended for future dynamic rendering of the Marine Life page.

**Schema:**

```json
{
  "species": [
    {
      "id": "string",
      "commonName": "string",
      "scientificName": "string",
      "category": "shark|ray|fish|other",
      "seasonalPresence": "year-round|seasonal",
      "diveSites": ["string"],      // Dive site identifiers
      "description": "string",
      "i18n": {
        "en": { "commonName": "string", "description": "string" }
      }
    }
  ]
}
```

---

### testimonials.json

**Path:** `assets/data/testimonials.json`

Guest testimonials for display on the homepage and other pages. `featured: true` marks testimonials for prominent display.

**Schema:**

```json
{
  "testimonials": [
    {
      "id": "string",             // Unique identifier, e.g. "t001"
      "author": "string",
      "country": "string",
      "countryCode": "string",    // ISO 3166-1 alpha-2 code
      "rating": "number",         // 1–5
      "date": "YYYY-MM-DD",
      "featured": "boolean",
      "text": "string",
      "i18n": { "en": { "text": "string" } }
    }
  ]
}
```

---

### company.json

**Path:** `assets/data/company.json`

Company-wide contact and identity information. Update here to propagate changes across any future script that reads this file.

**Schema:**

```json
{
  "company": {
    "name": "string",
    "legalName": "string",
    "tagline": "string",
    "location": {
      "island": "string",
      "atoll": "string",
      "country": "string",
      "countryCode": "string"
    },
    "contact": {
      "whatsappNumber": "string",
      "email": "string",
      "website": "string"
    },
    "social": {
      "instagram": "string",
      "facebook": "string"
    },
    "i18n": { "en": { "tagline": "string" } }
  }
}
```

---

## ID conventions

| Entity         | Example IDs                                        | Used as                                      |
|----------------|----------------------------------------------------|----------------------------------------------|
| Package        | `3n6d`, `5n9d`, `7n15d`                           | Radio input `value` in the booking form      |
| Accommodation  | `basic`, `standard`, `premium`, `deluxe`           | Radio input `value` in the booking form      |
| Meal plan      | `roomOnly`, `breakfast`, `halfBoard`, `fullBoard`  | `<select>` option `value`                    |
| Add-on         | `domesticFlight`, `equipmentRental`, `nitrox`, … | Checkbox input `value` in the booking form   |
| Promo code     | `EARLYBIRD`, `STAYWAVE10`, `DIVE2026`, …          | Guest-entered text (case-insensitive match)  |
| Currency       | `USD`, `EUR`, `GBP`, `MVR`                        | ISO 4217 codes; used in `Intl.NumberFormat`  |
| Marine species | `tiger-shark`, `manta-ray`, …                     | Kebab-case; for CMS/API joins                |
| Testimonial    | `t001`, `t002`, …                                 | Sequential; `t` prefix + zero-padded number |

**Rules:**
- IDs must be unique within their file.
- Package, accommodation, and add-on IDs must match HTML form input values exactly (case-sensitive).
- Promo code IDs are matched case-insensitively after `toUpperCase()` normalisation.
- Never reuse or reassign IDs after a record has been in production.

---

## Relationship map

```
packages.json
  └── seasonalPricing.*.tiers[].tierId
       (referenced internally; no cross-file join)

accommodation.json
  └── id → HTML booking form radio value

mealplans.json
  └── id → HTML booking form select option value

transport.json + equipment.json + experiences.json
  └── merged into addOnMap in dataLoader.js
  └── id → HTML booking form checkbox value

promocodes.json
  └── id → guest-entered promo code (normalised to uppercase)

settings.json
  └── booking.defaultCurrency → must be a valid code in currencies.json
  └── booking.whatsappNumber  → used in wa.me enquiry links

currencies.json
  └── code → referenced by settings.json defaultCurrency
           → referenced by booking form currency select
```

---

## Common tasks

### Update a package price

Open `assets/data/packages.json` and change the `pricePerDiver` value in the relevant tier. Example: to raise the solo rate for the `3n6d` package from 780 to 820:

```json
{ "tierId": "tier1", "label": "1 Diver", "minDivers": 1, "pricePerDiver": 820 }
```

### Add a promo code

Open `assets/data/promocodes.json` and append a new entry to the `codes` array:

```json
{
  "id": "WELCOME25",
  "type": "percentage",
  "value": 0.25,
  "expiresOn": "2026-12-31",
  "minBookingValue": 800,
  "minDivers": 1,
  "groupOnly": false
}
```

### Expire a promo code

Set `"expiresOn"` to a past date. The validation logic in `dataLoader.js` treats expired codes as invalid.

### Update the WhatsApp number

Open `assets/data/settings.json` and change `booking.whatsappNumber`. The number must be in international format without the `+` prefix (e.g. `"9607972103"`).

### Adjust the deposit percentage

Open `assets/data/settings.json` and change `booking.depositPercentage`. Value is a fraction: `0.3` = 30%.

### Enable tax or service charge

Open `assets/data/settings.json` and set `tax.enabled` or `serviceCharge.enabled` to `true`. Adjust `rate` and `label` as needed.

### Add a new accommodation tier

1. Open `assets/data/accommodation.json` and append a new object.
2. Add a matching radio input in the booking form HTML with the same `value`.
3. Optionally add a `[data-accommodation-price="<id>"]` element to show the price.

### Add a new add-on

1. Open the relevant file (`transport.json`, `equipment.json`, or `experiences.json`).
2. Append a new object with a unique `id`, `name`, `price`, `pricingModel`, and `appliesTo`.
3. Add a matching checkbox input in the booking form HTML with `name="addons"` and `value="<id>"`.

### Update currency exchange rates

Open `assets/data/currencies.json` and update the `rateFromUsd` values. All displayed prices are converted at runtime using these rates.

---

## Future-ready features

### Seasonal pricing

Each package already has a `seasonalPricing` map. To activate a season:

1. Add a new key (e.g. `"peak-2026"`) alongside `"default"` in the package's `seasonalPricing`.
2. When loading data, pass the season key: `DataLoader.load({ season: 'peak-2026' })`.
3. The loader falls back to `"default"` for any package that does not have the requested season key.

### Multiple currencies

Supported today. To add a currency:
1. Append to `assets/data/currencies.json`.
2. Add the currency code as an `<option>` in the booking form's currency `<select>`.

For live exchange rates, replace static `rateFromUsd` values with an API call in the `_parseCurrencies` function in `dataLoader.js`.

### Multilingual content

All data records include an `i18n` object keyed by BCP 47 language tag. To activate a locale:
1. Add `"fr": { "name": "..." }` entries to each record.
2. Pass the locale when loading: `DataLoader.load({ locale: 'fr' })`.

### Online payments

When introducing a payment gateway:
1. Add a `_futurePayments` section in `assets/data/settings.json` with gateway credentials/config.
2. Read those values in a new `paymentService.js` module — do not inline them in the calculator.

The `settings.json` file already contains a placeholder `_futurePayments` object for documentation purposes.

### CMS or database integration

To replace JSON files with a CMS/API:
1. Keep all function signatures in `dataLoader.js` unchanged.
2. Replace the `_fetchJson()` helper with calls to your CMS client or REST/GraphQL endpoint.
3. All downstream scripts (calculator, etc.) continue to work without modification.

Each JSON file can be migrated to a CMS collection independently — they are loosely coupled through string IDs rather than position-based references.
