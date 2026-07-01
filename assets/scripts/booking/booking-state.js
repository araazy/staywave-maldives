/**
 * @module booking-state
 * @description Single source of truth for all booking selections.
 *
 * The `booking` object is the canonical state for the entire booking flow.
 * Every form component reads from and writes to this object. Derived values
 * (totals, discounts, formatted output) are computed on demand by
 * pricing-engine and promo-engine rather than stored here.
 */

/**
 * @typedef {Object} BookingState
 * @property {string}      package       - Selected dive package key ('3n6d' | '5n9d' | '7n15d')
 * @property {string}      accommodation - Selected accommodation key ('basic' | 'standard' | 'premium' | 'deluxe')
 * @property {number}      divers        - Number of divers (1–20)
 * @property {number}      nonDivers     - Number of non-divers (0–20)
 * @property {string[]}    transport     - Selected transport add-on keys
 * @property {string}      mealPlan      - Selected meal plan key ('roomOnly' | 'breakfast' | 'halfBoard' | 'fullBoard')
 * @property {string[]}    equipment     - Selected equipment add-on keys (Diving category)
 * @property {string[]}    experiences   - Selected experience add-on keys (Experiences category)
 * @property {string|null} promoCode     - Applied promo code string, or null if none
 * @property {string}      arrivalDate   - ISO 8601 arrival date string (e.g. '2025-06-01'), or ''
 * @property {string}      departureDate - ISO 8601 departure date string, or ''
 * @property {string}      currency      - Display currency code (e.g. 'USD', 'EUR', 'GBP', 'MVR')
 */

/** @type {BookingState} */
export const booking = {
    package: '3n6d',
    accommodation: 'basic',
    divers: 2,
    nonDivers: 0,
    transport: [],
    mealPlan: 'roomOnly',
    equipment: [],
    experiences: [],
    promoCode: null,
    arrivalDate: '',
    departureDate: '',
    currency: 'USD'
};

/**
 * Resets the booking state to its default initial values.
 * Mutates the exported `booking` object in place.
 */
export const resetBooking = () => {
    booking.package = '3n6d';
    booking.accommodation = 'basic';
    booking.divers = 2;
    booking.nonDivers = 0;
    booking.transport = [];
    booking.mealPlan = 'roomOnly';
    booking.equipment = [];
    booking.experiences = [];
    booking.promoCode = null;
    booking.arrivalDate = '';
    booking.departureDate = '';
    booking.currency = 'USD';
};

/**
 * Returns a flat array of all selected add-on keys across transport,
 * equipment, and experiences categories.
 * @returns {string[]}
 */
export const getAllSelectedAddOns = () => [
    ...booking.transport,
    ...booking.equipment,
    ...booking.experiences
];
