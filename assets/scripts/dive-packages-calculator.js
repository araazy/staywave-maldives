/**
 * dive-packages-calculator.js
 *
 * Interactive booking calculator for the Build My Dive Holiday page.
 * All business data (packages, prices, add-ons, promo codes, settings) is
 * loaded from JSON files via DataLoader — nothing is hardcoded here.
 *
 * ─── To update prices or add products ───────────────────────────────────────
 * Edit the relevant file in assets/data/ — no JavaScript changes required:
 *   • Packages & group pricing → assets/data/packages.json
 *   • Accommodation            → assets/data/accommodation.json
 *   • Meal plans               → assets/data/mealplans.json
 *   • Equipment add-ons        → assets/data/equipment.json
 *   • Experience add-ons       → assets/data/experiences.json
 *   • Transport add-ons        → assets/data/transport.json
 *   • Promo / offer codes      → assets/data/promocodes.json
 *   • Global settings          → assets/data/settings.json
 *   • Currencies               → assets/data/currencies.json
 *
 * @requires DataLoader (assets/scripts/data/dataLoader.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    const calculatorForm = document.getElementById('booking-calculator');

    if (!calculatorForm) {
        return;
    }

    /* ── Load data from JSON files (falls back gracefully on failure) ───── */

    let config;
    try {
        config = await DataLoader.load();
    } catch (err) {
        console.error('[Calculator] DataLoader.load() threw unexpectedly:', err);
        return;
    }

    const {
        packageMap,
        accommodationMap,
        mealPlanMap,
        addOnMap,
        promoCodeMap,
        currencyMap,
        defaultCurrency,
        settings
    } = config;

    /* ── Mutable booking state ───────────────────────────────────────────── */

    const state = {
        appliedPromoCode: null,
        promoStatus: ''
    };

    /* ── DOM element references ──────────────────────────────────────────── */

    const summaryElements = {
        package:                 document.getElementById('summary-package'),
        accommodation:           document.getElementById('summary-accommodation'),
        divers:                  document.getElementById('summary-divers'),
        nonDivers:               document.getElementById('summary-non-divers'),
        travelDates:             document.getElementById('summary-travel-dates'),
        currencyLabel:           document.getElementById('summary-currency-label'),
        mealPlan:                document.getElementById('summary-meal-plan'),
        addons:                  document.getElementById('summary-addons'),
        packagePrice:            document.getElementById('summary-package-price'),
        accommodationCost:       document.getElementById('summary-accommodation-cost'),
        accommodationUpgradeCost:document.getElementById('summary-accommodation-upgrade-cost'),
        nonDiverCost:            document.getElementById('summary-non-diver-cost'),
        addonCost:               document.getElementById('summary-addon-cost'),
        groupDiscount:           document.getElementById('summary-group-discount'),
        promoDiscount:           document.getElementById('summary-promo-discount'),
        tax:                     document.getElementById('summary-tax'),
        serviceCharge:           document.getElementById('summary-service-charge'),
        deposit:                 document.getElementById('summary-deposit'),
        balance:                 document.getElementById('summary-balance'),
        totalSavings:            document.getElementById('summary-total-savings'),
        finalTotal:              document.getElementById('summary-final-total'),
        quoteTotal:              document.getElementById('quote-total'),
        currency:                document.getElementById('summary-currency'),
        screenReaderSummary:     document.getElementById('screenreader-summary'),
        groupTier:               document.getElementById('current-group-tier'),
        nights:                  document.getElementById('calculated-nights')
    };

    const promoStatusElement = document.getElementById('promo-status');
    const promoInput         = document.getElementById('promo-code-input');
    const mealPlanSelect     = document.getElementById('meal-plan');
    const addonsWrapper      = document.getElementById('addons-wrapper');

    /* ── Utility helpers ─────────────────────────────────────────────────── */

    const getSelectedRadioValue = (name, fallback) => {
        const selected = calculatorForm.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : fallback;
    };

    const parseIntWithBounds = (value, fallback, min, max) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) {
            return fallback;
        }
        return Math.min(max, Math.max(min, parsed));
    };

    const getDateValue = (id) => calculatorForm.querySelector(`#${id}`)?.value || '';

    const getNights = (arrivalDate, departureDate, packageNights) => {
        if (!arrivalDate || !departureDate) {
            return packageNights;
        }
        const arrival   = new Date(`${arrivalDate}T00:00:00`);
        const departure = new Date(`${departureDate}T00:00:00`);
        if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime()) || departure <= arrival) {
            return packageNights;
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.max(1, Math.round((departure - arrival) / msPerDay));
    };

    /* ── Currency helpers ────────────────────────────────────────────────── */

    const convertAmount = (usdAmount, currencyCode) => {
        const currency = currencyMap[currencyCode] || currencyMap[defaultCurrency];
        return usdAmount * (currency ? currency.rateFromUsd : 1);
    };

    const formatCurrency = (usdAmount, currencyCode) => {
        const code     = (currencyMap[currencyCode] ? currencyCode : defaultCurrency);
        const currency = currencyMap[code];
        const locale   = currency ? currency.locale : 'en-US';
        const converted = convertAmount(usdAmount, code);
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: code,
            maximumFractionDigits: 0
        }).format(converted);
    };

    const formatDateRange = (arrivalDate, departureDate) => {
        if (!arrivalDate || !departureDate) {
            return 'Not selected';
        }
        const arrival   = new Date(`${arrivalDate}T00:00:00`);
        const departure = new Date(`${departureDate}T00:00:00`);
        if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime()) || departure <= arrival) {
            return 'Not selected';
        }
        const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${fmt(arrival)} \u2192 ${fmt(departure)}`;
    };

    /* ── Pricing helpers ─────────────────────────────────────────────────── */

    /**
     * Returns the highest-matching group pricing tier for the given diver count.
     * Tiers are sourced from the selected package's activeTiers array.
     *
     * @param {Array}  tiers  - activeTiers from a package object.
     * @param {number} divers - number of divers.
     * @returns {object} The matched tier (or the first tier as fallback).
     */
    const getTierForDivers = (tiers, divers) => {
        let matched = tiers[0];
        for (const tier of tiers) {
            if (divers >= tier.minDivers) {
                matched = tier;
            }
        }
        return matched;
    };

    /**
     * Calculates the cost of a single add-on for the current booking.
     *
     * @param {string} addOnId  - Add-on id.
     * @param {number} divers   - Number of divers.
     * @param {number} nonDivers - Number of non-divers.
     * @returns {number} Cost in USD.
     */
    const calculateAddOnCost = (addOnId, divers, nonDivers) => {
        const addOn = addOnMap[addOnId];
        if (!addOn) {
            return 0;
        }
        const totalGuests = divers + nonDivers;
        switch (addOn.pricingModel) {
            case 'per_person_trip': return addOn.price * totalGuests;
            case 'per_diver_trip':
            case 'per_diver_unit':  return addOn.price * divers;
            case 'flat_trip':       return addOn.price;
            default:                return addOn.price;
        }
    };

    /**
     * Calculates the add-on cost attributable only to non-divers.
     * Used to break out the non-diver cost line in the summary.
     *
     * @param {string[]} selectedAddOnIds - Selected add-on ids.
     * @param {number}   nonDivers        - Number of non-divers.
     * @returns {number} Cost in USD.
     */
    const calculateNonDiverAddOnCost = (selectedAddOnIds, nonDivers) => {
        if (nonDivers === 0) {
            return 0;
        }
        return selectedAddOnIds.reduce((total, addOnId) => {
            const addOn = addOnMap[addOnId];
            if (!addOn || !Array.isArray(addOn.appliesTo) || !addOn.appliesTo.includes('nonDiver')) {
                return total;
            }
            if (addOn.pricingModel === 'per_person_trip') {
                return total + addOn.price * nonDivers;
            }
            return total;
        }, 0);
    };

    /* ── Promo code helpers ──────────────────────────────────────────────── */

    const getPromoValidation = (promoCode, subtotal, divers) => {
        if (!promoCode) {
            return { valid: false, message: '' };
        }
        const promo = promoCodeMap[promoCode];
        if (!promo) {
            return { valid: false, message: '❌ Invalid Offer Code' };
        }
        const expiryDate = new Date(`${promo.expiresOn}T23:59:59`);
        if (expiryDate < new Date()) {
            return { valid: false, message: '❌ Invalid Offer Code' };
        }
        if (subtotal < promo.minBookingValue || divers < promo.minDivers) {
            return { valid: false, message: '❌ Invalid Offer Code' };
        }
        if (promo.groupOnly && divers < 2) {
            return { valid: false, message: '❌ Invalid Offer Code' };
        }
        return { valid: true, message: '✔ Offer Code Applied' };
    };

    const calculatePromoDiscount = (promoCode, subtotal) => {
        const promo = promoCodeMap[promoCode];
        if (!promo) {
            return 0;
        }
        return promo.type === 'percentage' ? subtotal * promo.value : promo.value;
    };

    /* ── Form helpers ────────────────────────────────────────────────────── */

    const getSelectedAddOns = () =>
        Array.from(calculatorForm.querySelectorAll('input[name="addons"]:checked')).map((input) => input.value);

    /* ── Dynamic rendering ───────────────────────────────────────────────── */

    /**
     * Populates package price labels on the form so users see the current
     * base rates before interacting with any other control.
     * Prices reflect the solo-diver (tier1) rate for the current currency.
     */
    const populateStaticOptionPrices = () => {
        const firstCurrency = defaultCurrency;
        config.packages.forEach((pkg) => {
            const baseRate = pkg.activeTiers.length ? pkg.activeTiers[0].pricePerDiver : 0;
            const target   = calculatorForm.querySelector(`[data-package-price="${pkg.id}"]`);
            if (target) {
                target.textContent = formatCurrency(baseRate, firstCurrency);
            }
        });

        config.accommodations.forEach((acc) => {
            const target = calculatorForm.querySelector(`[data-accommodation-price="${acc.id}"]`);
            if (target) {
                target.textContent = formatCurrency(acc.nightlyPerRoom, firstCurrency);
            }
        });
    };

    /**
     * Builds the meal plan <select> options from loaded data.
     * Called once on initialisation; re-called if locale changes in future.
     */
    const renderMealPlanOptions = () => {
        if (!mealPlanSelect) {
            return;
        }
        mealPlanSelect.innerHTML = '';
        config.mealPlans.forEach((plan) => {
            const option       = document.createElement('option');
            option.value       = plan.id;
            option.textContent = plan.perPersonPerNight > 0
                ? `${plan.name} (${formatCurrency(plan.perPersonPerNight, defaultCurrency)} / person / night)`
                : plan.name;
            mealPlanSelect.appendChild(option);
        });
    };

    /**
     * Builds the add-ons section from loaded data, grouped by category.
     * Called once on initialisation.
     */
    const renderAddOnOptions = () => {
        if (!addonsWrapper) {
            return;
        }

        const categories = {};
        config.addOns.forEach((addOn) => {
            const cat = addOn.category || 'Other';
            if (!categories[cat]) {
                categories[cat] = [];
            }
            categories[cat].push(addOn);
        });

        addonsWrapper.innerHTML = Object.entries(categories).map(([category, addOns]) => {
            const items = addOns.map((addOn) => {
                const safeId = `addon-${addOn.id}`;
                return `
                    <label class="addon-option" for="${safeId}">
                        <input type="checkbox" id="${safeId}" name="addons" value="${addOn.id}">
                        <span>${addOn.name}</span>
                        <strong>${formatCurrency(addOn.price, defaultCurrency)}</strong>
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

    /* ── Counter control ─────────────────────────────────────────────────── */

    const updateCounter = (targetId, step) => {
        const input = calculatorForm.querySelector(`#${targetId}`);
        if (!input) {
            return;
        }
        const min          = Number.parseInt(input.min, 10) || 0;
        const max          = Number.parseInt(input.max, 10) || 99;
        const currentValue = Number.parseInt(input.value, 10) || min;
        input.value        = String(Math.min(max, Math.max(min, currentValue + step)));
    };

    /* ── Main quote calculator ───────────────────────────────────────────── */

    const updateQuote = () => {
        const packageKey      = getSelectedRadioValue('divePackage', '3n6d');
        const accommodationKey = getSelectedRadioValue('accommodation', 'basic');
        const selectedCurrency = calculatorForm.querySelector('#currency-select')?.value || defaultCurrency;
        const mealPlanKey     = mealPlanSelect?.value || 'roomOnly';
        const arrivalDate     = getDateValue('arrival-date');
        const departureDate   = getDateValue('departure-date');

        const divers    = parseIntWithBounds(calculatorForm.querySelector('#diver-count')?.value,     1, 1, 20);
        const nonDivers = parseIntWithBounds(calculatorForm.querySelector('#non-diver-count')?.value, 0, 0, 20);

        const selectedPackage       = packageMap[packageKey]       || config.packages[0];
        const selectedAccommodation = accommodationMap[accommodationKey] || config.accommodations[0];
        const basicAccommodation    = config.accommodations[0];
        const selectedMealPlan      = mealPlanMap[mealPlanKey]     || config.mealPlans[0];
        const selectedAddOns        = getSelectedAddOns();

        const tiers      = selectedPackage.activeTiers || [];
        const tier       = getTierForDivers(tiers, divers);
        const nights     = getNights(arrivalDate, departureDate, selectedPackage.nights);
        const totalGuests = divers + nonDivers;
        const roomCount  = Math.max(1, Math.ceil(totalGuests / settings.booking.occupancyPerRoom));

        const basePerDiver    = tiers.length ? tiers[0].pricePerDiver : 0;
        const tierPerDiver    = tier ? tier.pricePerDiver : basePerDiver;

        const baseDiveCost    = basePerDiver * divers;
        const packageCost     = tierPerDiver * divers;
        const groupDiscount   = Math.max(0, baseDiveCost - packageCost);

        const accommodationCost        = selectedAccommodation.nightlyPerRoom * roomCount * nights;
        const accommodationUpgradeCost = Math.max(
            0,
            (selectedAccommodation.nightlyPerRoom - basicAccommodation.nightlyPerRoom) * roomCount * nights
        );

        const mealPlanCost = selectedMealPlan.perPersonPerNight * totalGuests * nights;

        const addOnCost = selectedAddOns.reduce(
            (total, id) => total + calculateAddOnCost(id, divers, nonDivers), 0
        );

        const nonDiverAccommodationCost = (selectedAccommodation.nightlyPerRoom / settings.booking.occupancyPerRoom) * nonDivers * nights;
        const nonDiverMealCost          = selectedMealPlan.perPersonPerNight * nonDivers * nights;
        const nonDiverAddOnCost         = calculateNonDiverAddOnCost(selectedAddOns, nonDivers);
        const nonDiverCost              = nonDiverAccommodationCost + nonDiverMealCost + nonDiverAddOnCost;

        const subtotalBeforePromo = packageCost + accommodationCost + mealPlanCost + addOnCost;

        const promoValidation = getPromoValidation(state.appliedPromoCode, subtotalBeforePromo, divers);
        const promoDiscount   = promoValidation.valid
            ? Math.min(subtotalBeforePromo, calculatePromoDiscount(state.appliedPromoCode, subtotalBeforePromo))
            : 0;

        if (state.appliedPromoCode && !promoValidation.valid) {
            state.appliedPromoCode = null;
            state.promoStatus      = promoValidation.message;
        }

        const taxableTotal        = Math.max(0, subtotalBeforePromo - promoDiscount);
        const taxAmount           = settings.tax.enabled           ? taxableTotal * settings.tax.rate           : 0;
        const serviceChargeAmount = settings.serviceCharge.enabled ? taxableTotal * settings.serviceCharge.rate : 0;

        const finalTotal       = taxableTotal + taxAmount + serviceChargeAmount;
        const depositRequired  = finalTotal * settings.booking.depositPercentage;
        const remainingBalance = finalTotal - depositRequired;
        const totalSavings     = groupDiscount + promoDiscount;

        const addOnLabels = selectedAddOns.map((id) => addOnMap[id]?.name).filter(Boolean);

        /* Update summary panel */
        const set = (el, text) => { if (el) el.textContent = text; };

        set(summaryElements.package,                `${selectedPackage.name} (${selectedPackage.dives} dives)`);
        set(summaryElements.accommodation,           selectedAccommodation.name);
        set(summaryElements.divers,                  String(divers));
        set(summaryElements.nonDivers,               String(nonDivers));
        set(summaryElements.travelDates,             formatDateRange(arrivalDate, departureDate));
        set(summaryElements.currencyLabel,           selectedCurrency);
        set(summaryElements.mealPlan,                selectedMealPlan.name);
        set(summaryElements.addons,                  addOnLabels.length ? addOnLabels.join(', ') : 'None');
        set(summaryElements.packagePrice,            formatCurrency(packageCost,             selectedCurrency));
        set(summaryElements.accommodationCost,       formatCurrency(accommodationCost,       selectedCurrency));
        set(summaryElements.accommodationUpgradeCost,formatCurrency(accommodationUpgradeCost,selectedCurrency));
        set(summaryElements.nonDiverCost,            formatCurrency(nonDiverCost,            selectedCurrency));
        set(summaryElements.addonCost,               formatCurrency(addOnCost,               selectedCurrency));
        set(summaryElements.groupDiscount,           formatCurrency(groupDiscount,           selectedCurrency));
        set(summaryElements.promoDiscount,           formatCurrency(promoDiscount,           selectedCurrency));
        set(summaryElements.tax,                     formatCurrency(taxAmount,               selectedCurrency));
        set(summaryElements.serviceCharge,           formatCurrency(serviceChargeAmount,     selectedCurrency));
        set(summaryElements.deposit,                 formatCurrency(depositRequired,         selectedCurrency));
        set(summaryElements.balance,                 formatCurrency(remainingBalance,        selectedCurrency));
        set(summaryElements.totalSavings,            formatCurrency(totalSavings,            selectedCurrency));
        set(summaryElements.finalTotal,              formatCurrency(finalTotal,              selectedCurrency));
        set(summaryElements.quoteTotal,              formatCurrency(finalTotal,              selectedCurrency));
        set(summaryElements.currency,                selectedCurrency);
        set(summaryElements.groupTier,               tier ? tier.label : '');
        set(summaryElements.nights,                  String(nights));
        set(summaryElements.screenReaderSummary,
            `Updated estimate ${formatCurrency(finalTotal, selectedCurrency)} for ${divers} divers and ${nonDivers} non-divers.`);

        if (promoStatusElement) {
            promoStatusElement.textContent = state.promoStatus;
        }

        /* Build and set WhatsApp enquiry href */
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
            `Group Discount: ${formatCurrency(groupDiscount, selectedCurrency)}`,
            `Promo Code: ${state.appliedPromoCode || 'None'}`,
            `Estimated Total: ${formatCurrency(finalTotal, selectedCurrency)}`,
            `Deposit Required: ${formatCurrency(depositRequired, selectedCurrency)}`,
            `Preferred Flight Requirements: ${flightRequirements}`
        ].join('\n');

        const whatsappHref = `https://wa.me/${settings.booking.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        ['#whatsapp-enquiry-link', '.mobile-sticky-cta', '.whatsapp-button'].forEach((selector) => {
            const link = document.querySelector(selector);
            if (link) {
                link.href = whatsappHref;
            }
        });
    };

    /* ── Promo code application ──────────────────────────────────────────── */

    const applyPromoCode = () => {
        const enteredCode = (promoInput?.value || '').trim().toUpperCase();

        const packageKey      = getSelectedRadioValue('divePackage', '3n6d');
        const accommodationKey = getSelectedRadioValue('accommodation', 'basic');
        const mealPlanKey     = mealPlanSelect?.value || 'roomOnly';
        const arrivalDate     = getDateValue('arrival-date');
        const departureDate   = getDateValue('departure-date');
        const divers          = parseIntWithBounds(calculatorForm.querySelector('#diver-count')?.value,     1, 1, 20);
        const nonDivers       = parseIntWithBounds(calculatorForm.querySelector('#non-diver-count')?.value, 0, 0, 20);
        const selectedAddOns  = getSelectedAddOns();

        const selectedPackage       = packageMap[packageKey]       || config.packages[0];
        const selectedAccommodation = accommodationMap[accommodationKey] || config.accommodations[0];
        const selectedMealPlan      = mealPlanMap[mealPlanKey]     || config.mealPlans[0];
        const tiers                 = selectedPackage.activeTiers || [];
        const tier                  = getTierForDivers(tiers, divers);
        const nights                = getNights(arrivalDate, departureDate, selectedPackage.nights);
        const totalGuests           = divers + nonDivers;
        const roomCount             = Math.max(1, Math.ceil(totalGuests / settings.booking.occupancyPerRoom));
        const tierPerDiver          = tier ? tier.pricePerDiver : (tiers.length ? tiers[0].pricePerDiver : 0);
        const packageCost           = tierPerDiver * divers;
        const accommodationCost     = selectedAccommodation.nightlyPerRoom * roomCount * nights;
        const mealPlanCost          = selectedMealPlan.perPersonPerNight * totalGuests * nights;
        const addOnCost             = selectedAddOns.reduce((total, id) => total + calculateAddOnCost(id, divers, nonDivers), 0);
        const subtotal              = packageCost + accommodationCost + mealPlanCost + addOnCost;

        const validation = getPromoValidation(enteredCode, subtotal, divers);

        if (validation.valid) {
            state.appliedPromoCode = enteredCode;
            state.promoStatus      = validation.message;
        } else {
            state.appliedPromoCode = null;
            state.promoStatus      = enteredCode ? '❌ Invalid Offer Code' : '';
        }

        updateQuote();
    };

    /* ── Event listeners ─────────────────────────────────────────────────── */

    calculatorForm.addEventListener('input',  updateQuote);
    calculatorForm.addEventListener('change', updateQuote);

    calculatorForm.addEventListener('click', (event) => {
        const counterButton = event.target.closest('[data-counter-target]');
        if (!counterButton) {
            return;
        }
        const targetId = counterButton.getAttribute('data-counter-target');
        const step     = Number.parseInt(counterButton.getAttribute('data-counter-step') || '0', 10);
        updateCounter(targetId, step);
        updateQuote();
    });

    document.getElementById('apply-promo-button')?.addEventListener('click', applyPromoCode);

    promoInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyPromoCode();
        }
    });

    /* ── Initialise ──────────────────────────────────────────────────────── */

    renderMealPlanOptions();
    renderAddOnOptions();
    populateStaticOptionPrices();
    updateQuote();
});
