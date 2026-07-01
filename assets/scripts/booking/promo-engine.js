/**
 * @module promo-engine
 * @description Promo code validation and discount calculation.
 *
 * Promo codes are validated against the configured set before a discount is
 * applied. Validation checks: code existence, expiry date, minimum booking
 * value, minimum diver count, and group-only restriction.
 *
 * Consumers should call getPromoValidation() first, then calculatePromoDiscount()
 * only when validation returns valid: true.
 */

/**
 * @typedef {{ type: 'percentage'|'fixed', value: number, expiresOn: string, minBookingValue: number, minDivers: number, groupOnly?: boolean }} PromoCode
 * @typedef {{ valid: boolean, message: string }} PromoValidationResult
 */

/**
 * All supported promo codes.
 * - type 'percentage': discount = subtotal × value
 * - type 'fixed':      discount = value (USD)
 * @type {Record<string, PromoCode>}
 */
export const PROMO_CODES = {
    EARLYBIRD:   { type: 'percentage', value: 0.12, expiresOn: '2027-12-31', minBookingValue: 1000, minDivers: 1 },
    STAYWAVE10:  { type: 'percentage', value: 0.10, expiresOn: '2027-12-31', minBookingValue: 1200, minDivers: 1 },
    DIVE2026:    { type: 'fixed',      value: 220,  expiresOn: '2026-12-31', minBookingValue: 2000, minDivers: 2 },
    GROUPBONUS:  { type: 'fixed',      value: 400,  expiresOn: '2027-12-31', minBookingValue: 3000, minDivers: 6, groupOnly: true },
    REPEATGUEST: { type: 'percentage', value: 0.08, expiresOn: '2027-12-31', minBookingValue: 1500, minDivers: 1 }
};

/**
 * Validates a promo code against the current booking context.
 * Returns a result object indicating whether the code is valid and
 * a user-facing status message.
 *
 * @param {string|null} promoCode - The code entered by the user (should be upper-cased by caller)
 * @param {number}      subtotal  - Pre-promo booking subtotal in USD
 * @param {number}      divers    - Number of divers in the booking
 * @returns {PromoValidationResult}
 */
export const getPromoValidation = (promoCode, subtotal, divers) => {
    if (!promoCode) {
        return { valid: false, message: '' };
    }

    const promo = PROMO_CODES[promoCode];

    if (!promo) {
        return { valid: false, message: '\u274C Invalid Promo Code' };
    }

    const expiryDate = new Date(`${promo.expiresOn}T23:59:59`);

    if (expiryDate < new Date()) {
        return { valid: false, message: '\u274C Invalid Promo Code' };
    }

    if (subtotal < promo.minBookingValue || divers < promo.minDivers) {
        return { valid: false, message: '\u274C Invalid Promo Code' };
    }

    if (promo.groupOnly && divers < 2) {
        return { valid: false, message: '\u274C Invalid Promo Code' };
    }

    return { valid: true, message: '\u2714 Promo Code Applied' };
};

/**
 * Calculates the promo discount amount in USD.
 * Assumes the code has already been validated via getPromoValidation().
 *
 * @param {string} promoCode - Validated promo code (upper-cased)
 * @param {number} subtotal  - Pre-promo subtotal in USD
 * @returns {number} Discount amount in USD (0 if code not found)
 */
export const calculatePromoDiscount = (promoCode, subtotal) => {
    const promo = PROMO_CODES[promoCode];
    if (!promo) return 0;
    return promo.type === 'percentage' ? subtotal * promo.value : promo.value;
};
