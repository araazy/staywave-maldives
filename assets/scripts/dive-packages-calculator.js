/**
 * @module dive-packages-calculator
 * @description UI layer for the dive holiday pricing calculator.
 *
 * Responsibilities:
 *  - Read form inputs and sync them into the central `booking` state.
 *  - Call pricing and promo engine functions to compute derived values.
 *  - Render computed values into the summary DOM elements.
 *  - Wire all user interaction events (input, change, counter buttons, promo).
 *
 * Business logic (pricing, promos) is fully delegated to the booking
 * sub-modules. This file contains no inline calculations.
 */

import { booking, getAllSelectedAddOns } from './booking/booking-state.js';
import {
    PACKAGES,
    ACCOMMODATIONS,
    GROUP_PRICING_TIERS,
    MEAL_PLANS,
    ADD_ONS,
    DEPOSIT_PERCENTAGE,
    TAX_CONFIG,
    SERVICE_CHARGE_CONFIG,
    WHATSAPP_NUMBER,
    getTierForDivers,
    getNights,
    calculatePackageCost,
    calculateAccommodationCost,
    calculateAccommodationUpgradeCost,
    calculateMealPlanCost,
    calculateAddOnCost,
    calculateNonDiverCost,
    formatCurrency,
    formatDateRange
} from './booking/pricing-engine.js';
import { getPromoValidation, calculatePromoDiscount } from './booking/promo-engine.js';

document.addEventListener('DOMContentLoaded', () => {
    const calculatorForm = document.getElementById('booking-calculator');

    if (!calculatorForm) {
        return;
    }

    // -------------------------------------------------------------------------
    // DOM references
    // -------------------------------------------------------------------------

    const promoStatusElement = document.getElementById('promo-status');
    const promoInput         = document.getElementById('promo-code-input');
    const mealPlanSelect     = document.getElementById('meal-plan');
    const addonsWrapper      = document.getElementById('addons-wrapper');

    /* ── Utility helpers ─────────────────────────────────────────────────── */

    /** References to all summary panel output elements. */
    const summaryEl = {
        package:                  document.getElementById('summary-package'),
        accommodation:            document.getElementById('summary-accommodation'),
        divers:                   document.getElementById('summary-divers'),
        nonDivers:                document.getElementById('summary-non-divers'),
        travelDates:              document.getElementById('summary-travel-dates'),
        currencyLabel:            document.getElementById('summary-currency-label'),
        mealPlan:                 document.getElementById('summary-meal-plan'),
        addons:                   document.getElementById('summary-addons'),
        packagePrice:             document.getElementById('summary-package-price'),
        accommodationCost:        document.getElementById('summary-accommodation-cost'),
        accommodationUpgradeCost: document.getElementById('summary-accommodation-upgrade-cost'),
        nonDiverCost:             document.getElementById('summary-non-diver-cost'),
        addonCost:                document.getElementById('summary-addon-cost'),
        groupDiscount:            document.getElementById('summary-group-discount'),
        promoDiscount:            document.getElementById('summary-promo-discount'),
        tax:                      document.getElementById('summary-tax'),
        serviceCharge:            document.getElementById('summary-service-charge'),
        deposit:                  document.getElementById('summary-deposit'),
        balance:                  document.getElementById('summary-balance'),
        totalSavings:             document.getElementById('summary-total-savings'),
        finalTotal:               document.getElementById('summary-final-total'),
        quoteTotal:               document.getElementById('quote-total'),
        currency:                 document.getElementById('summary-currency'),
        screenReaderSummary:      document.getElementById('screenreader-summary'),
        groupTier:                document.getElementById('current-group-tier'),
        nights:                   document.getElementById('calculated-nights'),
        /** Form-section inline displays (separate IDs to avoid duplicate-ID violations). */
        formNights:               document.getElementById('form-calculated-nights'),
        formGroupTier:            document.getElementById('form-current-group-tier')
    };

    /** UI-only state that does not belong in the booking payload. */
    const uiState = { promoStatus: '' };

    // -------------------------------------------------------------------------
    // Form read helpers
    // -------------------------------------------------------------------------

    /**
     * Returns the value of the currently checked radio button for a named group,
     * or `fallback` if nothing is checked.
     * @param {string} name
     * @param {string} [fallback='']
     * @returns {string}
     */
    const getSelectedRadioValue = (name, fallback = '') => {
        const selected = calculatorForm.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : fallback;
    };

    /**
     * Parses an integer from a string value and clamps it to [min, max].
     * Returns `fallback` if the value is not a valid integer.
     * @param {string|undefined} value
     * @param {number} fallback
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const parseIntWithBounds = (value, fallback, min, max) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) return fallback;
        return Math.min(max, Math.max(min, parsed));
    };

    /**
     * Returns the string value of a date input by ID, or empty string if absent.
     * @param {string} id
     * @returns {string}
     */
    const getDateValue = (id) => calculatorForm.querySelector(`#${id}`)?.value || '';

    /**
     * Returns the keys of all currently checked add-on checkboxes.
     * @returns {string[]}
     */
    const getSelectedAddOns = () =>
        Array.from(calculatorForm.querySelectorAll('input[name="addons"]:checked'))
            .map((input) => input.value);

    // -------------------------------------------------------------------------
    // Booking state sync
    // -------------------------------------------------------------------------

    /**
     * Reads all form inputs and updates the central `booking` state object.
     * This is the single function responsible for keeping state in sync with
     * the form — it must be called before any quote calculation.
     */
    const syncBookingFromForm = () => {
        booking.package       = getSelectedRadioValue('divePackage', '3n6d');
        booking.accommodation = getSelectedRadioValue('accommodation', 'basic');
        booking.currency      = calculatorForm.querySelector('#currency-select')?.value || 'USD';
        booking.mealPlan      = calculatorForm.querySelector('#meal-plan')?.value || 'roomOnly';
        booking.divers        = parseIntWithBounds(calculatorForm.querySelector('#diver-count')?.value, 2, 1, 20);
        booking.nonDivers     = parseIntWithBounds(calculatorForm.querySelector('#non-diver-count')?.value, 0, 0, 20);
        booking.arrivalDate   = getDateValue('arrival-date');
        booking.departureDate = getDateValue('departure-date');

        const all = getSelectedAddOns();
        booking.transport    = all.filter((k) => ADD_ONS[k]?.category === 'Transportation');
        booking.equipment    = all.filter((k) => ADD_ONS[k]?.category === 'Diving');
        booking.experiences  = all.filter((k) => ADD_ONS[k]?.category === 'Experiences');
    };

    // -------------------------------------------------------------------------
    // UI rendering
    // -------------------------------------------------------------------------

    /**
     * Populates the meal plan <select> element from the MEAL_PLANS config.
     * Prices are formatted in USD at the base currency.
     */
    const renderMealPlanOptions = () => {
        if (!mealPlanSelect) return;
        mealPlanSelect.innerHTML = '';
        Object.entries(MEAL_PLANS).forEach(([key, plan]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${plan.name} (${formatCurrency(plan.perPersonPerNight, 'USD')} / person / night)`;
            mealPlanSelect.appendChild(option);
        });
    };

    /**
     * Renders add-on checkboxes inside `addonsWrapper`, grouped by category.
     * Prices are formatted in USD at the base currency.
     */
    const renderAddOnOptions = () => {
        if (!addonsWrapper) return;
        const categories = /** @type {Record<string, Array<{key:string}&AddOn>>} */ ({});
        Object.entries(ADD_ONS).forEach(([key, addOn]) => {
            if (!categories[addOn.category]) categories[addOn.category] = [];
            categories[addOn.category].push({ key, ...addOn });
        });

        addonsWrapper.innerHTML = Object.entries(categories).map(([category, addOns]) => {
            const items = addOns.map((addOn) => {
                const safeId = `addon-${addOn.id}`;
                return `
                    <label class="addon-option" for="${safeId}">
                        <input type="checkbox" id="${safeId}" name="addons" value="${addOn.id}">
                        <span>${addOn.name}</span>
                        <strong>${formatCurrency(addOn.price, 'USD')}</strong>
                    </label>
                `;
            }).join('');
            return `
                <fieldset class="addons-group">
                    <legend>${category}</legend>
                    ${items}
                </fieldset>
            `;
        }).join('');
    };

    /**
     * Writes base prices into the static price placeholder elements in the form.
     * Targets elements with `[data-package-price]` and `[data-accommodation-price]`
     * attributes, populated on initial render so users see prices before interacting.
     */
    const populateStaticOptionPrices = () => {
        const baseRates = GROUP_PRICING_TIERS[0].packageRates;
        Object.entries(baseRates).forEach(([packageKey, amount]) => {
            const target = calculatorForm.querySelector(`[data-package-price="${packageKey}"]`);
            if (target) target.textContent = formatCurrency(amount, 'USD');
        });
        Object.entries(ACCOMMODATIONS).forEach(([key, accommodation]) => {
            const target = calculatorForm.querySelector(`[data-accommodation-price="${key}"]`);
            if (target) target.textContent = formatCurrency(accommodation.nightlyPerRoom, 'USD');
        });
    };

    /**
     * Increments or decrements a numeric counter input by `step`.
     * Value is clamped to the element's `min` and `max` attributes.
     * @param {string} targetId - ID of the <input> element
     * @param {number} step     - Amount to add (negative to decrement)
     */
    const updateCounter = (targetId, step) => {
        const input = calculatorForm.querySelector(`#${targetId}`);
        if (!input) return;
        const min = Number.parseInt(input.min, 10) || 0;
        const max = Number.parseInt(input.max, 10) || 99;
        const current = Number.parseInt(input.value, 10) || min;
        input.value = String(Math.min(max, Math.max(min, current + step)));
    };

    /**
     * Helper that writes a value to a summary element only if the element exists.
     * @param {HTMLElement|null} el
     * @param {string} text
     */
    const setText = (el, text) => { if (el) el.textContent = text; };

    // -------------------------------------------------------------------------
    // Quote computation and rendering
    // -------------------------------------------------------------------------

    /**
     * Reads `booking` state, computes the full pricing breakdown using the
     * pricing and promo engines, then updates all summary DOM elements and
     * WhatsApp enquiry links.
     *
     * This function must only be called after syncBookingFromForm() has been
     * invoked to ensure the state is current.
     */
    const updateQuote = () => {
        const { package: packageKey, accommodation: accommodationKey, mealPlan: mealPlanKey,
                divers, nonDivers, arrivalDate, departureDate, currency } = booking;

        const selectedPackage       = PACKAGES[packageKey]            || PACKAGES['3n6d'];
        const selectedAccommodation = ACCOMMODATIONS[accommodationKey] || ACCOMMODATIONS.basic;
        const selectedMealPlan      = MEAL_PLANS[mealPlanKey]          || MEAL_PLANS.roomOnly;
        const selectedAddOns        = getAllSelectedAddOns();

        const tier      = getTierForDivers(divers);
        const nights    = getNights(arrivalDate, departureDate, selectedPackage.nights);
        const totalGuests = divers + nonDivers;
        const roomCount   = Math.max(1, Math.ceil(totalGuests / 2));

        const { packageCost, groupDiscount } = calculatePackageCost(packageKey, divers, tier);
        const accommodationCost         = calculateAccommodationCost(accommodationKey, roomCount, nights);
        const accommodationUpgradeCost  = calculateAccommodationUpgradeCost(accommodationKey, roomCount, nights);
        const mealPlanCost              = calculateMealPlanCost(mealPlanKey, totalGuests, nights);
        const addOnCost                 = selectedAddOns.reduce((sum, k) => sum + calculateAddOnCost(k, divers, nonDivers), 0);
        const nonDiverCost              = calculateNonDiverCost(accommodationKey, mealPlanKey, selectedAddOns, nonDivers, nights);

        const subtotalBeforePromo = packageCost + accommodationCost + mealPlanCost + addOnCost;

        const promoValidation = getPromoValidation(booking.promoCode, subtotalBeforePromo, divers);
        const promoDiscount   = promoValidation.valid
            ? Math.min(subtotalBeforePromo, calculatePromoDiscount(booking.promoCode, subtotalBeforePromo))
            : 0;

        // Invalidate the promo if it no longer qualifies (e.g. group size changed)
        if (booking.promoCode && !promoValidation.valid) {
            booking.promoCode = null;
            uiState.promoStatus = promoValidation.message;
        }

        const taxableTotal        = Math.max(0, subtotalBeforePromo - promoDiscount);
        const taxAmount           = TAX_CONFIG.enabled ? taxableTotal * TAX_CONFIG.rate : 0;
        const serviceChargeAmount = SERVICE_CHARGE_CONFIG.enabled ? taxableTotal * SERVICE_CHARGE_CONFIG.rate : 0;
        const finalTotal          = taxableTotal + taxAmount + serviceChargeAmount;
        const depositRequired     = finalTotal * DEPOSIT_PERCENTAGE;
        const remainingBalance    = finalTotal - depositRequired;
        const totalSavings        = groupDiscount + promoDiscount;

        const addOnLabels = selectedAddOns.map((k) => ADD_ONS[k]?.name).filter(Boolean);

        /** Shorthand formatter bound to the current display currency. */
        const fmt = (amount) => formatCurrency(amount, currency);

        // Update summary panel text
        setText(summaryEl.package,                  `${selectedPackage.name} (${selectedPackage.dives} dives)`);
        setText(summaryEl.accommodation,             selectedAccommodation.name);
        setText(summaryEl.divers,                    String(divers));
        setText(summaryEl.nonDivers,                 String(nonDivers));
        setText(summaryEl.travelDates,               formatDateRange(arrivalDate, departureDate));
        setText(summaryEl.currencyLabel,             currency);
        setText(summaryEl.mealPlan,                  selectedMealPlan.name);
        setText(summaryEl.addons,                    addOnLabels.length ? addOnLabels.join(', ') : 'None');
        setText(summaryEl.packagePrice,              fmt(packageCost));
        setText(summaryEl.accommodationCost,         fmt(accommodationCost));
        setText(summaryEl.accommodationUpgradeCost,  fmt(accommodationUpgradeCost));
        setText(summaryEl.nonDiverCost,              fmt(nonDiverCost));
        setText(summaryEl.addonCost,                 fmt(addOnCost));
        setText(summaryEl.groupDiscount,             fmt(groupDiscount));
        setText(summaryEl.promoDiscount,             fmt(promoDiscount));
        setText(summaryEl.tax,                       fmt(taxAmount));
        setText(summaryEl.serviceCharge,             fmt(serviceChargeAmount));
        setText(summaryEl.deposit,                   fmt(depositRequired));
        setText(summaryEl.balance,                   fmt(remainingBalance));
        setText(summaryEl.totalSavings,              fmt(totalSavings));
        setText(summaryEl.finalTotal,                fmt(finalTotal));
        setText(summaryEl.quoteTotal,                fmt(finalTotal));
        setText(summaryEl.currency,                  currency);
        setText(summaryEl.groupTier,                 tier.label);
        setText(summaryEl.nights,                    String(nights));
        setText(summaryEl.formNights,                String(nights));
        setText(summaryEl.formGroupTier,             tier.label);
        setText(summaryEl.screenReaderSummary,       `Updated estimate ${fmt(finalTotal)} for ${divers} divers and ${nonDivers} non-divers.`);

        if (promoStatusElement) promoStatusElement.textContent = uiState.promoStatus;

        // Build and apply WhatsApp enquiry link
        const flightRequirements = calculatorForm.querySelector('#flight-requirements')?.value?.trim() || 'Not specified';
        const whatsappMessage = [
            'Hi StayWave Maldives, I would like a dive holiday quote.',
            `Dive Package: ${selectedPackage.name}`,
            `Accommodation: ${selectedAccommodation.name}`,
            `Divers: ${divers}`,
            `Non-Divers: ${nonDivers}`,
            `Travel Dates: ${formatDateRange(arrivalDate, departureDate)}`,
            `Meal Plan: ${selectedMealPlan.name}`,
            `Add-ons: ${addOnLabels.length ? addOnLabels.join(', ') : 'None'}`,
            `Group Discount: ${fmt(groupDiscount)}`,
            `Promo Code: ${booking.promoCode || 'None'}`,
            `Estimated Total: ${fmt(finalTotal)}`,
            `Deposit Required: ${fmt(depositRequired)}`,
            `Preferred Flight Requirements: ${flightRequirements}`
        ].join('\n');

        const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

        ['#whatsapp-enquiry-link', '.mobile-sticky-cta', '.whatsapp-button'].forEach((selector) => {
            const link = document.querySelector(selector);
            if (link) link.href = whatsappHref;
        });

        /* Auto-save after every valid update */
        saveBookingSnapshot();
    };

    // -------------------------------------------------------------------------
    // Promo code handling
    // -------------------------------------------------------------------------

    /**
     * Reads the promo code input, validates it against the current booking
     * context, and updates `booking.promoCode` and `uiState.promoStatus`
     * accordingly. Triggers a full quote re-render when done.
     */
    const applyPromoCode = () => {
        syncBookingFromForm();
        const enteredCode = (promoInput?.value || '').trim().toUpperCase();

        if (!enteredCode) {
            booking.promoCode = null;
            uiState.promoStatus = '';
            updateQuote();
            return;
        }

        const { package: packageKey, accommodation: accommodationKey, mealPlan: mealPlanKey,
                divers, nonDivers, arrivalDate, departureDate } = booking;

        const selectedPackage = PACKAGES[packageKey] || PACKAGES['3n6d'];
        const tier            = getTierForDivers(divers);
        const nights          = getNights(arrivalDate, departureDate, selectedPackage.nights);
        const roomCount       = Math.max(1, Math.ceil((divers + nonDivers) / 2));
        const selectedAddOns  = getAllSelectedAddOns();

        const { packageCost }   = calculatePackageCost(packageKey, divers, tier);
        const accommodationCost = calculateAccommodationCost(accommodationKey, roomCount, nights);
        const mealPlanCost      = calculateMealPlanCost(mealPlanKey, divers + nonDivers, nights);
        const addOnCost         = selectedAddOns.reduce((sum, k) => sum + calculateAddOnCost(k, divers, nonDivers), 0);
        const subtotal          = packageCost + accommodationCost + mealPlanCost + addOnCost;

        const validation    = getPromoValidation(enteredCode, subtotal, divers);
        booking.promoCode   = validation.valid ? enteredCode : null;
        uiState.promoStatus = validation.valid ? validation.message : (enteredCode ? '\u274C Invalid Offer Code' : '');

        updateQuote();
    };

    // -------------------------------------------------------------------------
    // Event listeners
    // -------------------------------------------------------------------------

    calculatorForm.addEventListener('input', () => {
        syncBookingFromForm();
        updateQuote();
    });

    calculatorForm.addEventListener('change', () => {
        syncBookingFromForm();
        updateQuote();
    });

    calculatorForm.addEventListener('click', (event) => {
        const counterButton = event.target.closest('[data-counter-target]');
        if (!counterButton) return;
        const targetId = counterButton.getAttribute('data-counter-target');
        const step = Number.parseInt(counterButton.getAttribute('data-counter-step') || '0', 10);
        updateCounter(targetId, step);
        syncBookingFromForm();
        updateQuote();
    });

    document.getElementById('apply-promo-button')?.addEventListener('click', applyPromoCode);

    promoInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyPromoCode();
        }
    });

    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    renderMealPlanOptions();
    renderAddOnOptions();
    populateStaticOptionPrices();
    syncBookingFromForm();
    updateQuote();
    initPersistence();
});
