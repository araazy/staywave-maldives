/**
 * dataLoader.js
 *
 * Central data-access utility for StayWave Maldives.
 * Loads JSON configuration files from assets/data/, validates their shape,
 * and merges them into a single config object consumed by the booking calculator
 * and other page scripts.
 *
 * ─── How it works ───────────────────────────────────────────────────────────
 * 1. Call `DataLoader.load()` once (async, returns a Promise).
 * 2. The resolved value is a config object ready to be passed directly to the
 *    calculator's initialisation function.
 * 3. If any individual data file is missing or invalid, that section falls back
 *    to safe built-in defaults so the page continues to work — a warning is
 *    printed to the console so developers can identify the problem.
 *
 * ─── Replacing with a CMS or API ────────────────────────────────────────────
 * Swap the `fetch()` calls in `_fetchJson` with calls to your CMS/API client.
 * The rest of the code (validation, fallbacks, merging) stays the same.
 *
 * ─── Adding a new locale ────────────────────────────────────────────────────
 * Every data record has an optional `i18n` object keyed by BCP 47 language tag
 * (e.g. "fr", "de"). Pass a `locale` option to `DataLoader.load()` and the
 * loader will automatically prefer localised text over the default English.
 *
 * ─── Adding seasonal pricing ────────────────────────────────────────────────
 * Each package has a `seasonalPricing` map. Add a new key (e.g. "peak-2026")
 * alongside "default". Pass a `season` option to `DataLoader.load()` to
 * activate that season's rates.
 *
 * @module dataLoader
 */

/* ─── Path configuration ─────────────────────────────────────────────────── */

/**
 * Resolves the base URL for JSON data files.
 * Works with both root-relative paths (deployed) and relative paths (opened as
 * local file:// for development).
 */
const _getDataBasePath = () => {
    if (typeof window === 'undefined') {
        return 'assets/data/';
    }
    const { protocol, pathname } = window.location;
    if (protocol === 'file:') {
        // When opened directly from the filesystem, build a path relative to
        // the HTML file's directory so fetch() can still resolve the files.
        const dir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
        return `${dir}assets/data/`;
    }
    return '/assets/data/';
};

/* ─── Safe fetch helper ──────────────────────────────────────────────────── */

/**
 * Fetches a JSON file and returns the parsed object.
 * Returns `null` (and logs a warning) if the file is missing or unparseable.
 *
 * @param {string} url - Absolute or root-relative URL to a JSON file.
 * @returns {Promise<object|null>}
 */
const _fetchJson = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`[DataLoader] Could not load ${url} (HTTP ${response.status}). Using fallback.`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.warn(`[DataLoader] Failed to parse ${url}:`, err.message, '— Using fallback.');
        return null;
    }
};

/* ─── Validation helpers ─────────────────────────────────────────────────── */

/**
 * Returns `value` if it satisfies `predicate`, otherwise logs a warning and
 * returns `fallback`.
 */
const _validated = (label, value, predicate, fallback) => {
    if (!predicate(value)) {
        console.warn(`[DataLoader] Validation failed for "${label}". Using fallback.`);
        return fallback;
    }
    return value;
};

const _isArray = (v) => Array.isArray(v) && v.length > 0;
const _isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const _isString = (v) => typeof v === 'string' && v.length > 0;
const _isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
const _isPositiveNumber = (v) => _isNumber(v) && v >= 0;

/* ─── Built-in fallback data ─────────────────────────────────────────────── */
// These values mirror what was previously hardcoded in dive-packages-calculator.js.
// They exist ONLY as a last-resort fallback when JSON files cannot be loaded.

const _FALLBACK = {
    packages: [
        {
            id: '3n6d', name: '3 Nights \u2022 6 Dives', nights: 3, dives: 6,
            seasonalPricing: { default: { label: 'Standard', tiers: [
                { tierId: 'tier1',     label: '1 Diver',    minDivers: 1,  pricePerDiver: 780  },
                { tierId: 'tier2',     label: '2 Divers',   minDivers: 2,  pricePerDiver: 745  },
                { tierId: 'tier4',     label: '4 Divers',   minDivers: 4,  pricePerDiver: 710  },
                { tierId: 'tier6',     label: '6 Divers',   minDivers: 6,  pricePerDiver: 690  },
                { tierId: 'tier8',     label: '8 Divers',   minDivers: 8,  pricePerDiver: 660  },
                { tierId: 'tier10plus',label: '10+ Divers', minDivers: 10, pricePerDiver: 630  }
            ] } }
        },
        {
            id: '5n9d', name: '5 Nights \u2022 9 Dives', nights: 5, dives: 9,
            seasonalPricing: { default: { label: 'Standard', tiers: [
                { tierId: 'tier1',     label: '1 Diver',    minDivers: 1,  pricePerDiver: 1180 },
                { tierId: 'tier2',     label: '2 Divers',   minDivers: 2,  pricePerDiver: 1125 },
                { tierId: 'tier4',     label: '4 Divers',   minDivers: 4,  pricePerDiver: 1070 },
                { tierId: 'tier6',     label: '6 Divers',   minDivers: 6,  pricePerDiver: 1030 },
                { tierId: 'tier8',     label: '8 Divers',   minDivers: 8,  pricePerDiver: 980  },
                { tierId: 'tier10plus',label: '10+ Divers', minDivers: 10, pricePerDiver: 940  }
            ] } }
        },
        {
            id: '7n15d', name: '7 Nights \u2022 15 Dives', nights: 7, dives: 15,
            seasonalPricing: { default: { label: 'Standard', tiers: [
                { tierId: 'tier1',     label: '1 Diver',    minDivers: 1,  pricePerDiver: 1790 },
                { tierId: 'tier2',     label: '2 Divers',   minDivers: 2,  pricePerDiver: 1710 },
                { tierId: 'tier4',     label: '4 Divers',   minDivers: 4,  pricePerDiver: 1625 },
                { tierId: 'tier6',     label: '6 Divers',   minDivers: 6,  pricePerDiver: 1560 },
                { tierId: 'tier8',     label: '8 Divers',   minDivers: 8,  pricePerDiver: 1490 },
                { tierId: 'tier10plus',label: '10+ Divers', minDivers: 10, pricePerDiver: 1420 }
            ] } }
        }
    ],
    accommodations: [
        { id: 'basic',    name: 'Basic Package (Homestay)',     nightlyPerRoom: 75  },
        { id: 'standard', name: 'Standard Package (Guesthouse)',nightlyPerRoom: 110 },
        { id: 'premium',  name: 'Premium Stay',                 nightlyPerRoom: 150 },
        { id: 'deluxe',   name: 'Deluxe Stay',                  nightlyPerRoom: 220 }
    ],
    mealPlans: [
        { id: 'roomOnly',   name: 'Room Only',        perPersonPerNight: 0  },
        { id: 'breakfast',  name: 'Breakfast (BB)',   perPersonPerNight: 18 },
        { id: 'halfBoard',  name: 'Half Board (HB)',  perPersonPerNight: 38 },
        { id: 'fullBoard',  name: 'Full Board (FB)',  perPersonPerNight: 55 }
    ],
    transport: [
        { id: 'domesticFlight', name: 'Domestic Flight', category: 'Transportation', price: 295, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] }
    ],
    equipment: [
        { id: 'equipmentRental',  name: 'Full Equipment Rental',    category: 'Diving', price: 140, pricingModel: 'per_diver_trip', appliesTo: ['diver'] },
        { id: 'nitrox',           name: 'Nitrox',                    category: 'Diving', price: 90,  pricingModel: 'per_diver_trip', appliesTo: ['diver'] },
        { id: 'cylinderUpgrade',  name: '15L Cylinder Upgrade',      category: 'Diving', price: 75,  pricingModel: 'per_diver_trip', appliesTo: ['diver'] },
        { id: 'extraDive',        name: 'Extra Dive',                 category: 'Diving', price: 95,  pricingModel: 'per_diver_unit', appliesTo: ['diver'] },
        { id: 'privateGuide',     name: 'Private Dive Guide',         category: 'Diving', price: 210, pricingModel: 'flat_trip',      appliesTo: ['diver'] },
        { id: 'privateBoat',      name: 'Private Boat Charter',       category: 'Diving', price: 580, pricingModel: 'flat_trip',      appliesTo: ['diver'] },
        { id: 'underwaterPhoto',  name: 'Underwater Photography',     category: 'Diving', price: 120, pricingModel: 'per_diver_trip', appliesTo: ['diver'] }
    ],
    experiences: [
        { id: 'islandTour',   name: 'Island Tour',    category: 'Experiences', price: 60, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
        { id: 'sunsetCruise', name: 'Sunset Cruise',  category: 'Experiences', price: 70, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
        { id: 'fishingTrip',  name: 'Fishing Trip',   category: 'Experiences', price: 80, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
        { id: 'beachBbq',     name: 'Beach BBQ',       category: 'Experiences', price: 65, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] }
    ],
    promoCodes: [
        { id: 'EARLYBIRD',   type: 'percentage', value: 0.12, expiresOn: '2027-12-31', minBookingValue: 1000, minDivers: 1, groupOnly: false },
        { id: 'STAYWAVE10',  type: 'percentage', value: 0.10, expiresOn: '2027-12-31', minBookingValue: 1200, minDivers: 1, groupOnly: false },
        { id: 'DIVE2026',    type: 'fixed',      value: 220,  expiresOn: '2026-12-31', minBookingValue: 2000, minDivers: 2, groupOnly: false },
        { id: 'GROUPBONUS',  type: 'fixed',      value: 400,  expiresOn: '2027-12-31', minBookingValue: 3000, minDivers: 6, groupOnly: true  },
        { id: 'REPEATGUEST', type: 'percentage', value: 0.08, expiresOn: '2027-12-31', minBookingValue: 1500, minDivers: 1, groupOnly: false }
    ],
    currencies: [
        { code: 'USD', label: 'US Dollar',        symbol: '$', locale: 'en-US', rateFromUsd: 1     },
        { code: 'EUR', label: 'Euro',              symbol: '€', locale: 'en-IE', rateFromUsd: 0.92  },
        { code: 'GBP', label: 'British Pound',     symbol: '£', locale: 'en-GB', rateFromUsd: 0.78  },
        { code: 'MVR', label: 'Maldivian Rufiyaa', symbol: 'ރ.', locale: 'en-MV', rateFromUsd: 15.42 }
    ],
    settings: {
        booking: { defaultCurrency: 'USD', occupancyPerRoom: 2, depositPercentage: 0.3, whatsappNumber: '9607972103' },
        tax:           { enabled: false, rate: 0.16, label: 'GST' },
        serviceCharge: { enabled: false, rate: 0.10, label: 'Service Charge' },
        nonDiver:      { perPersonPerNight: 45 }
    }
};

/* ─── Individual parsers ─────────────────────────────────────────────────── */

/**
 * Parses packages from raw JSON, applying localisation and active season.
 */
const _parsePackages = (raw, locale, season) => {
    if (!raw || !_isArray(raw.packages)) {
        return _FALLBACK.packages;
    }
    return raw.packages.map((pkg) => {
        if (!_isString(pkg.id) || !_isString(pkg.name) || !_isNumber(pkg.nights) || !_isNumber(pkg.dives)) {
            console.warn(`[DataLoader] Skipping malformed package:`, pkg);
            return null;
        }
        const seasonKey = (pkg.seasonalPricing && pkg.seasonalPricing[season]) ? season : 'default';
        const pricing = (pkg.seasonalPricing && pkg.seasonalPricing[seasonKey]) || { tiers: [] };
        const tiers = _isArray(pricing.tiers) ? pricing.tiers.filter((t) =>
            _isString(t.tierId) && _isNumber(t.minDivers) && _isPositiveNumber(t.pricePerDiver)
        ) : [];
        const localName = (locale && pkg.i18n && pkg.i18n[locale] && pkg.i18n[locale].name) || pkg.name;
        return { ...pkg, name: localName, activeTiers: tiers };
    }).filter(Boolean);
};

/**
 * Parses accommodations from raw JSON.
 */
const _parseAccommodations = (raw, locale) => {
    if (!raw || !_isArray(raw.accommodations)) {
        return _FALLBACK.accommodations;
    }
    return raw.accommodations.map((a) => {
        if (!_isString(a.id) || !_isString(a.name) || !_isPositiveNumber(a.nightlyPerRoom)) {
            console.warn(`[DataLoader] Skipping malformed accommodation:`, a);
            return null;
        }
        const localName = (locale && a.i18n && a.i18n[locale] && a.i18n[locale].name) || a.name;
        return { ...a, name: localName };
    }).filter(Boolean);
};

/**
 * Parses meal plans from raw JSON.
 */
const _parseMealPlans = (raw, locale) => {
    if (!raw || !_isArray(raw.plans)) {
        return _FALLBACK.mealPlans;
    }
    return raw.plans.map((p) => {
        if (!_isString(p.id) || !_isString(p.name) || !_isPositiveNumber(p.perPersonPerNight)) {
            console.warn(`[DataLoader] Skipping malformed meal plan:`, p);
            return null;
        }
        const localName = (locale && p.i18n && p.i18n[locale] && p.i18n[locale].name) || p.name;
        return { ...p, name: localName };
    }).filter(Boolean);
};

/**
 * Parses add-on items (transport, equipment, experiences) from an array field.
 * `arrayKey` is the field name in the raw object (e.g. 'transport', 'equipment').
 */
const _parseAddOns = (raw, arrayKey, fallback, locale) => {
    if (!raw || !_isArray(raw[arrayKey])) {
        return fallback;
    }
    return raw[arrayKey].map((item) => {
        if (!_isString(item.id) || !_isString(item.name) || !_isPositiveNumber(item.price)) {
            console.warn(`[DataLoader] Skipping malformed add-on in "${arrayKey}":`, item);
            return null;
        }
        const localName = (locale && item.i18n && item.i18n[locale] && item.i18n[locale].name) || item.name;
        return { ...item, name: localName };
    }).filter(Boolean);
};

/**
 * Parses promo codes from raw JSON.
 */
const _parsePromoCodes = (raw) => {
    if (!raw || !_isArray(raw.codes)) {
        return _FALLBACK.promoCodes;
    }
    return raw.codes.map((c) => {
        if (!_isString(c.id) || !['percentage', 'fixed'].includes(c.type) || !_isPositiveNumber(c.value)) {
            console.warn(`[DataLoader] Skipping malformed promo code:`, c);
            return null;
        }
        return { ...c, groupOnly: Boolean(c.groupOnly) };
    }).filter(Boolean);
};

/**
 * Parses currencies from raw JSON.
 */
const _parseCurrencies = (raw) => {
    if (!raw || !_isArray(raw.currencies)) {
        return { default: 'USD', currencies: _FALLBACK.currencies };
    }
    const valid = raw.currencies.filter((c) =>
        _isString(c.code) && _isString(c.locale) && _isPositiveNumber(c.rateFromUsd)
    );
    if (!valid.length) {
        console.warn('[DataLoader] No valid currencies found. Using fallback.');
        return { default: 'USD', currencies: _FALLBACK.currencies };
    }
    const defaultCode = _isString(raw.default) ? raw.default : valid[0].code;
    return { default: defaultCode, currencies: valid };
};

/**
 * Parses global settings from raw JSON, merging with fallback defaults.
 */
const _parseSettings = (raw) => {
    const fb = _FALLBACK.settings;
    if (!raw || !_isObject(raw)) {
        return fb;
    }
    return {
        booking: {
            defaultCurrency: (raw.booking && _isString(raw.booking.defaultCurrency)) ? raw.booking.defaultCurrency : fb.booking.defaultCurrency,
            occupancyPerRoom: (raw.booking && _isPositiveNumber(raw.booking.occupancyPerRoom)) ? raw.booking.occupancyPerRoom : fb.booking.occupancyPerRoom,
            depositPercentage: (raw.booking && _isPositiveNumber(raw.booking.depositPercentage)) ? raw.booking.depositPercentage : fb.booking.depositPercentage,
            whatsappNumber: (raw.booking && _isString(raw.booking.whatsappNumber)) ? raw.booking.whatsappNumber : fb.booking.whatsappNumber
        },
        tax: {
            enabled: (raw.tax && typeof raw.tax.enabled === 'boolean') ? raw.tax.enabled : fb.tax.enabled,
            rate: (raw.tax && _isPositiveNumber(raw.tax.rate)) ? raw.tax.rate : fb.tax.rate,
            label: (raw.tax && _isString(raw.tax.label)) ? raw.tax.label : fb.tax.label
        },
        serviceCharge: {
            enabled: (raw.serviceCharge && typeof raw.serviceCharge.enabled === 'boolean') ? raw.serviceCharge.enabled : fb.serviceCharge.enabled,
            rate: (raw.serviceCharge && _isPositiveNumber(raw.serviceCharge.rate)) ? raw.serviceCharge.rate : fb.serviceCharge.rate,
            label: (raw.serviceCharge && _isString(raw.serviceCharge.label)) ? raw.serviceCharge.label : fb.serviceCharge.label
        },
        nonDiver: {
            perPersonPerNight: (raw.nonDiver && _isPositiveNumber(raw.nonDiver.perPersonPerNight)) ? raw.nonDiver.perPersonPerNight : fb.nonDiver.perPersonPerNight
        }
    };
};

/* ─── Public API ─────────────────────────────────────────────────────────── */

/**
 * @typedef {object} LoadOptions
 * @property {string} [locale='en'] - BCP 47 language tag for localised content.
 * @property {string} [season='default'] - Season key for seasonal pricing.
 */

/**
 * @typedef {object} DataConfig
 * @property {Array}  packages       - Parsed dive packages with active tier pricing.
 * @property {Array}  accommodations - Parsed accommodation options.
 * @property {Array}  mealPlans      - Parsed meal plan options.
 * @property {Array}  addOns         - Merged add-ons (transport + equipment + experiences).
 * @property {Array}  promoCodes     - Parsed promo codes.
 * @property {object} currencyMap    - Map of currency code → currency object.
 * @property {string} defaultCurrency - Default currency code.
 * @property {object} settings       - Parsed booking settings.
 */

/**
 * Loads all data files and returns a merged, validated config object.
 *
 * Usage:
 *   const config = await DataLoader.load();
 *
 * With options:
 *   const config = await DataLoader.load({ locale: 'fr', season: 'peak-2026' });
 *
 * @param {LoadOptions} [options={}]
 * @returns {Promise<DataConfig>}
 */
const DataLoader = {
    async load({ locale = 'en', season = 'default' } = {}) {
        const base = _getDataBasePath();

        const [
            rawPackages,
            rawAccommodation,
            rawMealPlans,
            rawTransport,
            rawEquipment,
            rawExperiences,
            rawPromoCodes,
            rawCurrencies,
            rawSettings
        ] = await Promise.all([
            _fetchJson(`${base}packages.json`),
            _fetchJson(`${base}accommodation.json`),
            _fetchJson(`${base}mealplans.json`),
            _fetchJson(`${base}transport.json`),
            _fetchJson(`${base}equipment.json`),
            _fetchJson(`${base}experiences.json`),
            _fetchJson(`${base}promocodes.json`),
            _fetchJson(`${base}currencies.json`),
            _fetchJson(`${base}settings.json`)
        ]);

        const packages       = _parsePackages(rawPackages, locale, season);
        const accommodations = _parseAccommodations(rawAccommodation, locale);
        const mealPlans      = _parseMealPlans(rawMealPlans, locale);
        const transport      = _parseAddOns(rawTransport,   'transport',   _FALLBACK.transport,   locale);
        const equipment      = _parseAddOns(rawEquipment,   'equipment',   _FALLBACK.equipment,   locale);
        const experiences    = _parseAddOns(rawExperiences, 'experiences', _FALLBACK.experiences, locale);
        const promoCodes     = _parsePromoCodes(rawPromoCodes);
        const currencyResult = _parseCurrencies(rawCurrencies);
        const settings       = _parseSettings(rawSettings);

        // Merge all add-on types into a single flat map keyed by id.
        const addOns = [...transport, ...equipment, ...experiences];
        const addOnMap = Object.fromEntries(addOns.map((a) => [a.id, a]));

        // Build lookup maps for fast access by id.
        const packageMap      = Object.fromEntries(packages.map((p) => [p.id, p]));
        const accommodationMap = Object.fromEntries(accommodations.map((a) => [a.id, a]));
        const mealPlanMap     = Object.fromEntries(mealPlans.map((m) => [m.id, m]));
        const promoCodeMap    = Object.fromEntries(promoCodes.map((c) => [c.id, c]));
        const currencyMap     = Object.fromEntries(currencyResult.currencies.map((c) => [c.code, c]));

        return {
            packages,
            packageMap,
            accommodations,
            accommodationMap,
            mealPlans,
            mealPlanMap,
            addOns,
            addOnMap,
            promoCodes,
            promoCodeMap,
            currencyMap,
            defaultCurrency: currencyResult.default,
            settings
        };
    }
};

// Export for use as an ES module (e.g. in future bundled builds).
// In the current static-site context the script is loaded as a plain <script>
// tag and DataLoader is accessible via the global scope.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataLoader };
}
