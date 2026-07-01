/**
 * @module pricing-engine
 * @description Pricing configuration data and pure calculation functions.
 *
 * All pricing logic lives here. Functions are pure — they accept booking
 * inputs and return calculated values without DOM side effects or state
 * mutations. Consumers (the UI layer) call these functions and render the
 * results.
 */

// ---------------------------------------------------------------------------
// Configuration data
// ---------------------------------------------------------------------------

/**
 * @typedef {{ name: string, nights: number, dives: number }} DivePackage
 * @typedef {{ name: string, nightlyPerRoom: number }} Accommodation
 * @typedef {{ key: string, label: string, minDivers: number, packageRates: Record<string,number> }} PricingTier
 * @typedef {{ name: string, perPersonPerNight: number }} MealPlan
 * @typedef {{ name: string, category: string, price: number, pricingModel: string, appliesTo: string[] }} AddOn
 */

/**
 * Dive package definitions. Object keys match form radio `value` attributes.
 * @type {Record<string, DivePackage>}
 */
export const PACKAGES = {
    '3n6d':  { name: '3 Nights \u2022 6 Dives',  nights: 3, dives: 6  },
    '5n9d':  { name: '5 Nights \u2022 9 Dives',  nights: 5, dives: 9  },
    '7n15d': { name: '7 Nights \u2022 15 Dives', nights: 7, dives: 15 }
};

/**
 * Accommodation options with nightly per-room rates in USD.
 * @type {Record<string, Accommodation>}
 */
export const ACCOMMODATIONS = {
    basic:    { name: 'Basic Package (Homestay)',       nightlyPerRoom: 75  },
    standard: { name: 'Standard Package (Guesthouse)',  nightlyPerRoom: 110 },
    premium:  { name: 'Premium Stay',                   nightlyPerRoom: 150 },
    deluxe:   { name: 'Deluxe Stay',                    nightlyPerRoom: 220 }
};

/**
 * Group pricing tiers ordered by minDivers ascending.
 * A tier applies when the diver count is >= its minDivers threshold.
 * packageRates gives the per-diver price for each package key.
 * @type {PricingTier[]}
 */
export const GROUP_PRICING_TIERS = [
    { key: 'tier1',     label: '1 Diver',    minDivers: 1,  packageRates: { '3n6d': 780, '5n9d': 1180, '7n15d': 1790 } },
    { key: 'tier2',     label: '2 Divers',   minDivers: 2,  packageRates: { '3n6d': 745, '5n9d': 1125, '7n15d': 1710 } },
    { key: 'tier4',     label: '4 Divers',   minDivers: 4,  packageRates: { '3n6d': 710, '5n9d': 1070, '7n15d': 1625 } },
    { key: 'tier6',     label: '6 Divers',   minDivers: 6,  packageRates: { '3n6d': 690, '5n9d': 1030, '7n15d': 1560 } },
    { key: 'tier8',     label: '8 Divers',   minDivers: 8,  packageRates: { '3n6d': 660, '5n9d':  980, '7n15d': 1490 } },
    { key: 'tier10plus', label: '10+ Divers', minDivers: 10, packageRates: { '3n6d': 630, '5n9d':  940, '7n15d': 1420 } }
];

/**
 * Meal plan options with per-person per-night supplement in USD.
 * @type {Record<string, MealPlan>}
 */
export const MEAL_PLANS = {
    roomOnly:  { name: 'Room Only',       perPersonPerNight: 0  },
    breakfast: { name: 'Breakfast (BB)',  perPersonPerNight: 18 },
    halfBoard: { name: 'Half Board (HB)', perPersonPerNight: 38 },
    fullBoard:  { name: 'Full Board (FB)', perPersonPerNight: 55 }
};

/**
 * Available add-ons.
 *
 * pricingModel values:
 *   'per_person_trip'  — price × (divers + nonDivers)
 *   'per_diver_trip'   — price × divers
 *   'per_diver_unit'   — price × divers (same as per_diver_trip for one unit)
 *   'flat_trip'        — fixed price regardless of group size
 *
 * @type {Record<string, AddOn>}
 */
export const ADD_ONS = {
    domesticFlight:  { name: 'Domestic Flight',          category: 'Transportation', price: 295, pricingModel: 'per_person_trip',  appliesTo: ['diver', 'nonDiver'] },
    equipmentRental: { name: 'Full Equipment Rental',     category: 'Diving',         price: 140, pricingModel: 'per_diver_trip',   appliesTo: ['diver'] },
    nitrox:          { name: 'Nitrox',                    category: 'Diving',         price: 90,  pricingModel: 'per_diver_trip',   appliesTo: ['diver'] },
    cylinderUpgrade: { name: '15L Cylinder Upgrade',      category: 'Diving',         price: 75,  pricingModel: 'per_diver_trip',   appliesTo: ['diver'] },
    extraDive:       { name: 'Extra Dive',                category: 'Diving',         price: 95,  pricingModel: 'per_diver_unit',   appliesTo: ['diver'] },
    privateGuide:    { name: 'Private Dive Guide',        category: 'Diving',         price: 210, pricingModel: 'flat_trip',        appliesTo: ['diver'] },
    privateBoat:     { name: 'Private Boat Charter',      category: 'Diving',         price: 580, pricingModel: 'flat_trip',        appliesTo: ['diver'] },
    islandTour:      { name: 'Island Tour',               category: 'Experiences',    price: 60,  pricingModel: 'per_person_trip',  appliesTo: ['diver', 'nonDiver'] },
    sunsetCruise:    { name: 'Sunset Cruise',             category: 'Experiences',    price: 70,  pricingModel: 'per_person_trip',  appliesTo: ['diver', 'nonDiver'] },
    fishingTrip:     { name: 'Fishing Trip',              category: 'Experiences',    price: 80,  pricingModel: 'per_person_trip',  appliesTo: ['diver', 'nonDiver'] },
    beachBbq:        { name: 'Beach BBQ',                 category: 'Experiences',    price: 65,  pricingModel: 'per_person_trip',  appliesTo: ['diver', 'nonDiver'] },
    underwaterPhoto:  { name: 'Underwater Photography',   category: 'Experiences',    price: 120, pricingModel: 'per_diver_trip',   appliesTo: ['diver'] }
};

/** Maximum number of guests sharing one room. */
export const OCCUPANCY_PER_ROOM = 2;

/** Deposit as a fraction of the final total (e.g. 0.3 = 30%). */
export const DEPOSIT_PERCENTAGE = 0.3;

/** Tax configuration. Set `enabled: true` to activate. */
export const TAX_CONFIG = { enabled: false, rate: 0.16, label: 'GST' };

/** Service charge configuration. Set `enabled: true` to activate. */
export const SERVICE_CHARGE_CONFIG = { enabled: false, rate: 0.1, label: 'Service Charge' };

/** WhatsApp business contact number (digits only). */
export const WHATSAPP_NUMBER = '9607972103';

/**
 * Exchange rates from USD to supported currencies.
 * @type {Record<string, number>}
 */
export const CURRENCY_RATES_FROM_USD = { USD: 1, EUR: 0.92, GBP: 0.78, MVR: 15.42 };

/**
 * Supported display currencies with their BCP 47 locale strings for
 * Intl.NumberFormat.
 * @type {Record<string, { locale: string }>}
 */
export const SUPPORTED_CURRENCIES = {
    USD: { locale: 'en-US' },
    EUR: { locale: 'en-IE' },
    GBP: { locale: 'en-GB' },
    MVR: { locale: 'en-MV' }
};

// ---------------------------------------------------------------------------
// Pure calculation functions
// ---------------------------------------------------------------------------

/**
 * Returns the applicable group pricing tier for a given diver count.
 * Iterates all tiers and returns the last one whose minDivers is <= divers.
 * @param {number} divers
 * @returns {PricingTier}
 */
export const getTierForDivers = (divers) => {
    let matchedTier = GROUP_PRICING_TIERS[0];
    GROUP_PRICING_TIERS.forEach((tier) => {
        if (divers >= tier.minDivers) {
            matchedTier = tier;
        }
    });
    return matchedTier;
};

/**
 * Calculates the effective number of nights from the provided dates.
 * Falls back to the package default if dates are absent or invalid.
 * @param {string} arrivalDate   - ISO date string (e.g. '2025-06-01'), or ''
 * @param {string} departureDate - ISO date string, or ''
 * @param {number} packageNights - Default nights from the selected package
 * @returns {number}
 */
export const getNights = (arrivalDate, departureDate, packageNights) => {
    if (!arrivalDate || !departureDate) {
        return packageNights;
    }
    const arrival = new Date(`${arrivalDate}T00:00:00`);
    const departure = new Date(`${departureDate}T00:00:00`);
    if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime()) || departure <= arrival) {
        return packageNights;
    }
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.round((departure - arrival) / MS_PER_DAY));
};

/**
 * Calculates the dive package cost including the group discount.
 * @param {string}      packageKey - Key from PACKAGES
 * @param {number}      divers
 * @param {PricingTier} tier       - Result of getTierForDivers()
 * @returns {{ packageCost: number, baseDiveCost: number, groupDiscount: number }}
 */
export const calculatePackageCost = (packageKey, divers, tier) => {
    const baseRate = GROUP_PRICING_TIERS[0].packageRates[packageKey] || 0;
    const tierRate = tier.packageRates[packageKey] || baseRate;
    const baseDiveCost = baseRate * divers;
    const packageCost = tierRate * divers;
    return {
        packageCost,
        baseDiveCost,
        groupDiscount: Math.max(0, baseDiveCost - packageCost)
    };
};

/**
 * Calculates the accommodation cost for the booking.
 * @param {string} accommodationKey - Key from ACCOMMODATIONS
 * @param {number} roomCount
 * @param {number} nights
 * @returns {number}
 */
export const calculateAccommodationCost = (accommodationKey, roomCount, nights) => {
    const accommodation = ACCOMMODATIONS[accommodationKey] || ACCOMMODATIONS.basic;
    return accommodation.nightlyPerRoom * roomCount * nights;
};

/**
 * Calculates the accommodation upgrade cost relative to the base (basic) rate.
 * Returns 0 if the basic option is selected.
 * @param {string} accommodationKey
 * @param {number} roomCount
 * @param {number} nights
 * @returns {number}
 */
export const calculateAccommodationUpgradeCost = (accommodationKey, roomCount, nights) => {
    const accommodation = ACCOMMODATIONS[accommodationKey] || ACCOMMODATIONS.basic;
    const diff = accommodation.nightlyPerRoom - ACCOMMODATIONS.basic.nightlyPerRoom;
    return Math.max(0, diff * roomCount * nights);
};

/**
 * Calculates the meal plan supplement cost.
 * @param {string} mealPlanKey  - Key from MEAL_PLANS
 * @param {number} totalGuests  - Divers + non-divers
 * @param {number} nights
 * @returns {number}
 */
export const calculateMealPlanCost = (mealPlanKey, totalGuests, nights) => {
    const plan = MEAL_PLANS[mealPlanKey] || MEAL_PLANS.roomOnly;
    return plan.perPersonPerNight * totalGuests * nights;
};

/**
 * Calculates the cost of a single add-on for the full guest group.
 * @param {string} addOnKey  - Key from ADD_ONS
 * @param {number} divers
 * @param {number} nonDivers
 * @returns {number}
 */
export const calculateAddOnCost = (addOnKey, divers, nonDivers) => {
    const addOn = ADD_ONS[addOnKey];
    if (!addOn) return 0;
    if (addOn.pricingModel === 'per_person_trip') return (divers + nonDivers) * addOn.price;
    if (addOn.pricingModel === 'per_diver_trip' || addOn.pricingModel === 'per_diver_unit') return divers * addOn.price;
    return addOn.price; // flat_trip
};

/**
 * Calculates the total add-on cost applicable to non-divers only.
 * Used to break out the non-diver portion of the add-on line item.
 * @param {string[]} selectedAddOns
 * @param {number}   nonDivers
 * @returns {number}
 */
export const calculateNonDiverAddOnCost = (selectedAddOns, nonDivers) => {
    if (nonDivers === 0) return 0;
    return selectedAddOns.reduce((total, addOnKey) => {
        const addOn = ADD_ONS[addOnKey];
        if (!addOn || !addOn.appliesTo.includes('nonDiver')) return total;
        return total + (addOn.price * nonDivers);
    }, 0);
};

/**
 * Calculates the total non-diver surcharge (accommodation share + meals + add-ons).
 * @param {string}   accommodationKey
 * @param {string}   mealPlanKey
 * @param {string[]} selectedAddOns
 * @param {number}   nonDivers
 * @param {number}   nights
 * @returns {number}
 */
export const calculateNonDiverCost = (accommodationKey, mealPlanKey, selectedAddOns, nonDivers, nights) => {
    if (nonDivers === 0) return 0;
    const accommodation = ACCOMMODATIONS[accommodationKey] || ACCOMMODATIONS.basic;
    const mealPlan = MEAL_PLANS[mealPlanKey] || MEAL_PLANS.roomOnly;
    const nonDiverAccommodationCost = (accommodation.nightlyPerRoom / OCCUPANCY_PER_ROOM) * nonDivers * nights;
    const nonDiverMealCost = mealPlan.perPersonPerNight * nonDivers * nights;
    const nonDiverAddOnCost = calculateNonDiverAddOnCost(selectedAddOns, nonDivers);
    return nonDiverAccommodationCost + nonDiverMealCost + nonDiverAddOnCost;
};

/**
 * Converts a USD amount to the target currency using the configured exchange rates.
 * @param {number} usdAmount
 * @param {string} currency - Currency code (e.g. 'USD', 'EUR')
 * @returns {number}
 */
export const convertAmount = (usdAmount, currency) => {
    const rate = CURRENCY_RATES_FROM_USD[currency] || CURRENCY_RATES_FROM_USD.USD;
    return usdAmount * rate;
};

/**
 * Formats a USD amount as a localised currency string in the target currency.
 * @param {number} usdAmount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (usdAmount, currency) => {
    const locale = SUPPORTED_CURRENCIES[currency]?.locale || 'en-US';
    const converted = convertAmount(usdAmount, currency);
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    }).format(converted);
};

/**
 * Formats an arrival/departure date pair as a human-readable range string.
 * Returns 'Not selected' if either date is absent or the range is invalid.
 * @param {string} arrivalDate
 * @param {string} departureDate
 * @returns {string}
 */
export const formatDateRange = (arrivalDate, departureDate) => {
    if (!arrivalDate || !departureDate) return 'Not selected';
    const arrival = new Date(`${arrivalDate}T00:00:00`);
    const departure = new Date(`${departureDate}T00:00:00`);
    if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime()) || departure <= arrival) {
        return 'Not selected';
    }
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${arrival.toLocaleDateString('en-US', opts)} \u2192 ${departure.toLocaleDateString('en-US', opts)}`;
};
