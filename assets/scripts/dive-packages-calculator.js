document.addEventListener('DOMContentLoaded', () => {
    const calculatorForm = document.getElementById('booking-calculator');

    if (!calculatorForm) {
        return;
    }

    const CALCULATOR_CONFIG = {
        defaults: {
            currency: 'USD',
            occupancyPerRoom: 2,
            depositPercentage: 0.3,
            whatsappNumber: '9607972103'
        },
        currencySettings: {
            defaultCurrency: 'USD',
            ratesFromUsd: {
                USD: 1,
                EUR: 0.92,
                GBP: 0.78,
                MVR: 15.42
            },
            supported: {
                USD: { locale: 'en-US' },
                EUR: { locale: 'en-IE' },
                GBP: { locale: 'en-GB' },
                MVR: { locale: 'en-MV' }
            }
        },
        taxSettings: {
            enabled: false,
            rate: 0.16,
            label: 'GST'
        },
        serviceChargeSettings: {
            enabled: false,
            rate: 0.1,
            label: 'Service Charge'
        },
        divePackages: {
            '3n6d': { name: '3 Nights \u2022 6 Dives', nights: 3, dives: 6 },
            '5n9d': { name: '5 Nights \u2022 9 Dives', nights: 5, dives: 9 },
            '7n15d': { name: '7 Nights \u2022 15 Dives', nights: 7, dives: 15 }
        },
        accommodations: {
            basic: { name: 'Basic Package (Homestay)', nightlyPerRoom: 75 },
            standard: { name: 'Standard Package (Guesthouse)', nightlyPerRoom: 110 },
            premium: { name: 'Premium Stay', nightlyPerRoom: 150 },
            deluxe: { name: 'Deluxe Stay', nightlyPerRoom: 220 }
        },
        groupPricingTiers: [
            { key: 'tier1', label: '1 Diver', minDivers: 1, packageRates: { '3n6d': 780, '5n9d': 1180, '7n15d': 1790 } },
            { key: 'tier2', label: '2 Divers', minDivers: 2, packageRates: { '3n6d': 745, '5n9d': 1125, '7n15d': 1710 } },
            { key: 'tier4', label: '4 Divers', minDivers: 4, packageRates: { '3n6d': 710, '5n9d': 1070, '7n15d': 1625 } },
            { key: 'tier6', label: '6 Divers', minDivers: 6, packageRates: { '3n6d': 690, '5n9d': 1030, '7n15d': 1560 } },
            { key: 'tier8', label: '8 Divers', minDivers: 8, packageRates: { '3n6d': 660, '5n9d': 980, '7n15d': 1490 } },
            { key: 'tier10plus', label: '10+ Divers', minDivers: 10, packageRates: { '3n6d': 630, '5n9d': 940, '7n15d': 1420 } }
        ],
        mealPlans: {
            roomOnly: { name: 'Room Only', perPersonPerNight: 0 },
            breakfast: { name: 'Breakfast (BB)', perPersonPerNight: 18 },
            halfBoard: { name: 'Half Board (HB)', perPersonPerNight: 38 },
            fullBoard: { name: 'Full Board (FB)', perPersonPerNight: 55 }
        },
        addOns: {
            domesticFlight: { name: 'Domestic Flight', category: 'Transportation', price: 295, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
            equipmentRental: { name: 'Full Equipment Rental', category: 'Diving', price: 140, pricingModel: 'per_diver_trip', appliesTo: ['diver'] },
            nitrox: { name: 'Nitrox', category: 'Diving', price: 90, pricingModel: 'per_diver_trip', appliesTo: ['diver'] },
            cylinderUpgrade: { name: '15L Cylinder Upgrade', category: 'Diving', price: 75, pricingModel: 'per_diver_trip', appliesTo: ['diver'] },
            extraDive: { name: 'Extra Dive', category: 'Diving', price: 95, pricingModel: 'per_diver_unit', appliesTo: ['diver'] },
            privateGuide: { name: 'Private Dive Guide', category: 'Diving', price: 210, pricingModel: 'flat_trip', appliesTo: ['diver'] },
            privateBoat: { name: 'Private Boat Charter', category: 'Diving', price: 580, pricingModel: 'flat_trip', appliesTo: ['diver'] },
            islandTour: { name: 'Island Tour', category: 'Experiences', price: 60, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
            sunsetCruise: { name: 'Sunset Cruise', category: 'Experiences', price: 70, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
            fishingTrip: { name: 'Fishing Trip', category: 'Experiences', price: 80, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
            beachBbq: { name: 'Beach BBQ', category: 'Experiences', price: 65, pricingModel: 'per_person_trip', appliesTo: ['diver', 'nonDiver'] },
            underwaterPhoto: { name: 'Underwater Photography', category: 'Experiences', price: 120, pricingModel: 'per_diver_trip', appliesTo: ['diver'] }
        },
        promoCodes: {
            EARLYBIRD: { type: 'percentage', value: 0.12, expiresOn: '2027-12-31', minBookingValue: 1000, minDivers: 1 },
            STAYWAVE10: { type: 'percentage', value: 0.1, expiresOn: '2027-12-31', minBookingValue: 1200, minDivers: 1 },
            DIVE2026: { type: 'fixed', value: 220, expiresOn: '2026-12-31', minBookingValue: 2000, minDivers: 2 },
            GROUPBONUS: { type: 'fixed', value: 400, expiresOn: '2027-12-31', minBookingValue: 3000, minDivers: 6, groupOnly: true },
            REPEATGUEST: { type: 'percentage', value: 0.08, expiresOn: '2027-12-31', minBookingValue: 1500, minDivers: 1 }
        }
    };

    const state = {
        appliedPromoCode: null,
        promoStatus: ''
    };

    const summaryElements = {
        package: document.getElementById('summary-package'),
        accommodation: document.getElementById('summary-accommodation'),
        divers: document.getElementById('summary-divers'),
        nonDivers: document.getElementById('summary-non-divers'),
        travelDates: document.getElementById('summary-travel-dates'),
        currencyLabel: document.getElementById('summary-currency-label'),
        mealPlan: document.getElementById('summary-meal-plan'),
        addons: document.getElementById('summary-addons'),
        packagePrice: document.getElementById('summary-package-price'),
        accommodationCost: document.getElementById('summary-accommodation-cost'),
        accommodationUpgradeCost: document.getElementById('summary-accommodation-upgrade-cost'),
        nonDiverCost: document.getElementById('summary-non-diver-cost'),
        addonCost: document.getElementById('summary-addon-cost'),
        groupDiscount: document.getElementById('summary-group-discount'),
        promoDiscount: document.getElementById('summary-promo-discount'),
        tax: document.getElementById('summary-tax'),
        serviceCharge: document.getElementById('summary-service-charge'),
        deposit: document.getElementById('summary-deposit'),
        balance: document.getElementById('summary-balance'),
        totalSavings: document.getElementById('summary-total-savings'),
        finalTotal: document.getElementById('summary-final-total'),
        quoteTotal: document.getElementById('quote-total'),
        currency: document.getElementById('summary-currency'),
        screenReaderSummary: document.getElementById('screenreader-summary'),
        groupTier: document.getElementById('current-group-tier'),
        nights: document.getElementById('calculated-nights')
    };

    const promoStatusElement = document.getElementById('promo-status');
    const promoInput = document.getElementById('promo-code-input');
    const mealPlanSelect = document.getElementById('meal-plan');
    const addonsWrapper = document.getElementById('addons-wrapper');

    const getSelectedRadioValue = (name, fallback) => {
        const selected = calculatorForm.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : fallback;
    };

    const parseIntWithBounds = (value, fallback, min, max) => {
        const parsedValue = Number.parseInt(value, 10);

        if (Number.isNaN(parsedValue)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, parsedValue));
    };

    const getDateValue = (id) => calculatorForm.querySelector(`#${id}`)?.value || '';

    const getNights = (arrivalDate, departureDate, packageNights) => {
        if (!arrivalDate || !departureDate) {
            return packageNights;
        }

        const arrival = new Date(`${arrivalDate}T00:00:00`);
        const departure = new Date(`${departureDate}T00:00:00`);

        if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime()) || departure <= arrival) {
            return packageNights;
        }

        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return Math.max(1, Math.round((departure - arrival) / millisecondsPerDay));
    };

    const getTierForDivers = (divers) => {
        let matchedTier = CALCULATOR_CONFIG.groupPricingTiers[0];

        CALCULATOR_CONFIG.groupPricingTiers.forEach((tier) => {
            if (divers >= tier.minDivers) {
                matchedTier = tier;
            }
        });

        return matchedTier;
    };

    const convertAmount = (usdAmount, selectedCurrency) => {
        const rate = CALCULATOR_CONFIG.currencySettings.ratesFromUsd[selectedCurrency] || CALCULATOR_CONFIG.currencySettings.ratesFromUsd.USD;
        return usdAmount * rate;
    };

    const formatCurrency = (usdAmount, selectedCurrency) => {
        const locale = CALCULATOR_CONFIG.currencySettings.supported[selectedCurrency]?.locale || 'en-US';
        const convertedAmount = convertAmount(usdAmount, selectedCurrency);

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: selectedCurrency,
            maximumFractionDigits: 0
        }).format(convertedAmount);
    };

    const formatDateRange = (arrivalDate, departureDate) => {
        if (!arrivalDate || !departureDate) {
            return 'Not selected';
        }

        const arrival = new Date(`${arrivalDate}T00:00:00`);
        const departure = new Date(`${departureDate}T00:00:00`);

        if (Number.isNaN(arrival.getTime()) || Number.isNaN(departure.getTime()) || departure <= arrival) {
            return 'Not selected';
        }

        return `${arrival.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} \u2192 ${departure.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const calculateAddOnCost = (addOnKey, divers, nonDivers) => {
        const addOn = CALCULATOR_CONFIG.addOns[addOnKey];

        if (!addOn) {
            return 0;
        }

        if (addOn.pricingModel === 'per_person_trip') {
            return (divers + nonDivers) * addOn.price;
        }

        if (addOn.pricingModel === 'per_diver_trip' || addOn.pricingModel === 'per_diver_unit') {
            return divers * addOn.price;
        }

        return addOn.price;
    };

    const calculateNonDiverAddOnCost = (selectedAddOns, nonDivers) => {
        return selectedAddOns.reduce((total, addOnKey) => {
            const addOn = CALCULATOR_CONFIG.addOns[addOnKey];

            if (!addOn || nonDivers === 0 || !addOn.appliesTo.includes('nonDiver')) {
                return total;
            }

            return total + (addOn.price * nonDivers);
        }, 0);
    };

    const getPromoValidation = (promoCode, subtotal, divers) => {
        if (!promoCode) {
            return { valid: false, message: '' };
        }

        const promo = CALCULATOR_CONFIG.promoCodes[promoCode];

        if (!promo) {
            return { valid: false, message: '\u274c Invalid Offer Code' };
        }

        const currentDate = new Date();
        const expiryDate = new Date(`${promo.expiresOn}T23:59:59`);

        if (expiryDate < currentDate) {
            return { valid: false, message: '\u274c Invalid Offer Code' };
        }

        if (subtotal < promo.minBookingValue || divers < promo.minDivers) {
            return { valid: false, message: '\u274c Invalid Offer Code' };
        }

        if (promo.groupOnly && divers < 2) {
            return { valid: false, message: '\u274c Invalid Offer Code' };
        }

        return { valid: true, message: '\u2714 Offer Code Applied' };
    };

    const calculatePromoDiscount = (promoCode, subtotal) => {
        const promo = CALCULATOR_CONFIG.promoCodes[promoCode];

        if (!promo) {
            return 0;
        }

        if (promo.type === 'percentage') {
            return subtotal * promo.value;
        }

        return promo.value;
    };

    const getSelectedAddOns = () => {
        return Array.from(calculatorForm.querySelectorAll('input[name="addons"]:checked')).map((input) => input.value);
    };

    const populateStaticOptionPrices = () => {
        Object.entries(CALCULATOR_CONFIG.groupPricingTiers[0].packageRates).forEach(([packageKey, amount]) => {
            const target = calculatorForm.querySelector(`[data-package-price="${packageKey}"]`);
            if (target) {
                target.textContent = formatCurrency(amount, CALCULATOR_CONFIG.defaults.currency);
            }
        });

        Object.entries(CALCULATOR_CONFIG.accommodations).forEach(([key, accommodation]) => {
            const target = calculatorForm.querySelector(`[data-accommodation-price="${key}"]`);
            if (target) {
                target.textContent = formatCurrency(accommodation.nightlyPerRoom, CALCULATOR_CONFIG.defaults.currency);
            }
        });
    };

    const renderMealPlanOptions = () => {
        if (!mealPlanSelect) return;
        mealPlanSelect.innerHTML = '';

        Object.entries(CALCULATOR_CONFIG.mealPlans).forEach(([key, plan]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${plan.name} (${formatCurrency(plan.perPersonPerNight, CALCULATOR_CONFIG.defaults.currency)} / person / night)`;
            mealPlanSelect.appendChild(option);
        });
    };

    const renderAddOnOptions = () => {
        if (!addonsWrapper) return;
        const categories = {};

        Object.entries(CALCULATOR_CONFIG.addOns).forEach(([key, addOn]) => {
            if (!categories[addOn.category]) {
                categories[addOn.category] = [];
            }

            categories[addOn.category].push({ key, ...addOn });
        });

        addonsWrapper.innerHTML = Object.entries(categories).map(([category, addOns]) => {
            const items = addOns.map((addOn) => {
                const safeId = `addon-${addOn.key}`;
                return `
                    <label class="addon-option" for="${safeId}">
                        <input type="checkbox" id="${safeId}" name="addons" value="${addOn.key}">
                        <span>${addOn.name}</span>
                        <strong>${formatCurrency(addOn.price, CALCULATOR_CONFIG.defaults.currency)}</strong>
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

    const updateCounter = (targetId, step) => {
        const input = calculatorForm.querySelector(`#${targetId}`);

        if (!input) {
            return;
        }

        const min = Number.parseInt(input.min, 10) || 0;
        const max = Number.parseInt(input.max, 10) || 99;
        const currentValue = Number.parseInt(input.value, 10) || min;
        input.value = String(Math.min(max, Math.max(min, currentValue + step)));
    };

    const updateQuote = () => {
        const packageKey = getSelectedRadioValue('divePackage', '3n6d');
        const accommodationKey = getSelectedRadioValue('accommodation', 'basic');
        const selectedCurrency = calculatorForm.querySelector('#currency-select')?.value || CALCULATOR_CONFIG.currencySettings.defaultCurrency;
        const mealPlanKey = calculatorForm.querySelector('#meal-plan')?.value || 'roomOnly';

        const divers = parseIntWithBounds(calculatorForm.querySelector('#diver-count')?.value, 1, 1, 20);
        const nonDivers = parseIntWithBounds(calculatorForm.querySelector('#non-diver-count')?.value, 0, 0, 20);
        const arrivalDate = getDateValue('arrival-date');
        const departureDate = getDateValue('departure-date');

        const selectedPackage = CALCULATOR_CONFIG.divePackages[packageKey] || CALCULATOR_CONFIG.divePackages['3n6d'];
        const selectedAccommodation = CALCULATOR_CONFIG.accommodations[accommodationKey] || CALCULATOR_CONFIG.accommodations.basic;
        const basicAccommodation = CALCULATOR_CONFIG.accommodations.basic;
        const selectedMealPlan = CALCULATOR_CONFIG.mealPlans[mealPlanKey] || CALCULATOR_CONFIG.mealPlans.roomOnly;
        const selectedAddOns = getSelectedAddOns();

        const tier = getTierForDivers(divers);
        const nights = getNights(arrivalDate, departureDate, selectedPackage.nights);
        const totalGuests = divers + nonDivers;
        const roomCount = Math.max(1, Math.ceil(totalGuests / CALCULATOR_CONFIG.defaults.occupancyPerRoom));

        const basePackageRate = CALCULATOR_CONFIG.groupPricingTiers[0].packageRates[packageKey] || 0;
        const selectedPackageRate = tier.packageRates[packageKey] || basePackageRate;

        const baseDiveCost = basePackageRate * divers;
        const packageCost = selectedPackageRate * divers;
        const groupDiscount = Math.max(0, baseDiveCost - packageCost);

        const accommodationCost = selectedAccommodation.nightlyPerRoom * roomCount * nights;
        const accommodationUpgradeCost = Math.max(0, (selectedAccommodation.nightlyPerRoom - basicAccommodation.nightlyPerRoom) * roomCount * nights);

        const mealPlanCost = selectedMealPlan.perPersonPerNight * totalGuests * nights;

        const addOnCost = selectedAddOns.reduce((total, addOnKey) => total + calculateAddOnCost(addOnKey, divers, nonDivers), 0);

        const nonDiverAccommodationCost = (selectedAccommodation.nightlyPerRoom / CALCULATOR_CONFIG.defaults.occupancyPerRoom) * nonDivers * nights;
        const nonDiverMealCost = selectedMealPlan.perPersonPerNight * nonDivers * nights;
        const nonDiverAddOnCost = calculateNonDiverAddOnCost(selectedAddOns, nonDivers);
        const nonDiverCost = nonDiverAccommodationCost + nonDiverMealCost + nonDiverAddOnCost;

        const subtotalBeforePromo = packageCost + accommodationCost + mealPlanCost + addOnCost;

        const promoValidation = getPromoValidation(state.appliedPromoCode, subtotalBeforePromo, divers);
        const promoDiscount = promoValidation.valid ? Math.min(subtotalBeforePromo, calculatePromoDiscount(state.appliedPromoCode, subtotalBeforePromo)) : 0;

        if (state.appliedPromoCode && !promoValidation.valid) {
            state.appliedPromoCode = null;
            state.promoStatus = promoValidation.message;
        }

        const taxableTotal = Math.max(0, subtotalBeforePromo - promoDiscount);
        const taxAmount = CALCULATOR_CONFIG.taxSettings.enabled ? taxableTotal * CALCULATOR_CONFIG.taxSettings.rate : 0;
        const serviceChargeAmount = CALCULATOR_CONFIG.serviceChargeSettings.enabled ? taxableTotal * CALCULATOR_CONFIG.serviceChargeSettings.rate : 0;

        const finalTotal = taxableTotal + taxAmount + serviceChargeAmount;
        const depositRequired = finalTotal * CALCULATOR_CONFIG.defaults.depositPercentage;
        const remainingBalance = finalTotal - depositRequired;
        const totalSavings = groupDiscount + promoDiscount;

        const addOnLabels = selectedAddOns.map((key) => CALCULATOR_CONFIG.addOns[key]?.name).filter(Boolean);
        const flightRequirements = calculatorForm.querySelector('#flight-requirements')?.value?.trim() || 'Not specified';

        if (summaryElements.package) summaryElements.package.textContent = `${selectedPackage.name} (${selectedPackage.dives} dives)`;
        if (summaryElements.accommodation) summaryElements.accommodation.textContent = selectedAccommodation.name;
        if (summaryElements.divers) summaryElements.divers.textContent = String(divers);
        if (summaryElements.nonDivers) summaryElements.nonDivers.textContent = String(nonDivers);
        if (summaryElements.travelDates) summaryElements.travelDates.textContent = formatDateRange(arrivalDate, departureDate);
        if (summaryElements.currencyLabel) summaryElements.currencyLabel.textContent = selectedCurrency;
        if (summaryElements.mealPlan) summaryElements.mealPlan.textContent = selectedMealPlan.name;
        if (summaryElements.addons) summaryElements.addons.textContent = addOnLabels.length ? addOnLabels.join(', ') : 'None';
        if (summaryElements.packagePrice) summaryElements.packagePrice.textContent = formatCurrency(packageCost, selectedCurrency);
        if (summaryElements.accommodationCost) summaryElements.accommodationCost.textContent = formatCurrency(accommodationCost, selectedCurrency);
        if (summaryElements.accommodationUpgradeCost) summaryElements.accommodationUpgradeCost.textContent = formatCurrency(accommodationUpgradeCost, selectedCurrency);
        if (summaryElements.nonDiverCost) summaryElements.nonDiverCost.textContent = formatCurrency(nonDiverCost, selectedCurrency);
        if (summaryElements.addonCost) summaryElements.addonCost.textContent = formatCurrency(addOnCost, selectedCurrency);
        if (summaryElements.groupDiscount) summaryElements.groupDiscount.textContent = formatCurrency(groupDiscount, selectedCurrency);
        if (summaryElements.promoDiscount) summaryElements.promoDiscount.textContent = formatCurrency(promoDiscount, selectedCurrency);
        if (summaryElements.tax) summaryElements.tax.textContent = formatCurrency(taxAmount, selectedCurrency);
        if (summaryElements.serviceCharge) summaryElements.serviceCharge.textContent = formatCurrency(serviceChargeAmount, selectedCurrency);
        if (summaryElements.deposit) summaryElements.deposit.textContent = formatCurrency(depositRequired, selectedCurrency);
        if (summaryElements.balance) summaryElements.balance.textContent = formatCurrency(remainingBalance, selectedCurrency);
        if (summaryElements.totalSavings) summaryElements.totalSavings.textContent = formatCurrency(totalSavings, selectedCurrency);
        if (summaryElements.finalTotal) summaryElements.finalTotal.textContent = formatCurrency(finalTotal, selectedCurrency);
        if (summaryElements.quoteTotal) summaryElements.quoteTotal.textContent = formatCurrency(finalTotal, selectedCurrency);
        if (summaryElements.currency) summaryElements.currency.textContent = selectedCurrency;
        if (summaryElements.groupTier) summaryElements.groupTier.textContent = tier.label;
        if (summaryElements.nights) summaryElements.nights.textContent = String(nights);
        if (summaryElements.screenReaderSummary) {
            summaryElements.screenReaderSummary.textContent = `Updated estimate ${formatCurrency(finalTotal, selectedCurrency)} for ${divers} divers and ${nonDivers} non-divers.`;
        }

        if (promoStatusElement) promoStatusElement.textContent = state.promoStatus;

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

        const whatsappHref = `https://wa.me/${CALCULATOR_CONFIG.defaults.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        ['#whatsapp-enquiry-link', '.mobile-sticky-cta', '.whatsapp-button'].forEach((selector) => {
            const link = document.querySelector(selector);
            if (link) {
                link.href = whatsappHref;
            }
        });

        /* Auto-save after every valid update */
        saveBookingSnapshot();
    };

    const applyPromoCode = () => {
        const enteredCode = (promoInput?.value || '').trim().toUpperCase();
        state.appliedPromoCode = enteredCode || null;
        state.promoStatus = enteredCode ? '\u274c Invalid Offer Code' : '';

        const packageKey = getSelectedRadioValue('divePackage', '3n6d');
        const accommodationKey = getSelectedRadioValue('accommodation', 'basic');
        const mealPlanKey = calculatorForm.querySelector('#meal-plan')?.value || 'roomOnly';
        const divers = parseIntWithBounds(calculatorForm.querySelector('#diver-count')?.value, 1, 1, 20);
        const nonDivers = parseIntWithBounds(calculatorForm.querySelector('#non-diver-count')?.value, 0, 0, 20);
        const selectedAddOns = getSelectedAddOns();

        const packageRates = getTierForDivers(divers).packageRates;
        const packageCost = (packageRates[packageKey] || 0) * divers;
        const selectedAccommodation = CALCULATOR_CONFIG.accommodations[accommodationKey] || CALCULATOR_CONFIG.accommodations.basic;
        const selectedMealPlan = CALCULATOR_CONFIG.mealPlans[mealPlanKey] || CALCULATOR_CONFIG.mealPlans.roomOnly;
        const nights = getNights(getDateValue('arrival-date'), getDateValue('departure-date'), CALCULATOR_CONFIG.divePackages[packageKey]?.nights || 3);
        const roomCount = Math.max(1, Math.ceil((divers + nonDivers) / CALCULATOR_CONFIG.defaults.occupancyPerRoom));
        const addOnCost = selectedAddOns.reduce((total, addOnKey) => total + calculateAddOnCost(addOnKey, divers, nonDivers), 0);
        const subtotal = packageCost + (selectedAccommodation.nightlyPerRoom * roomCount * nights) + (selectedMealPlan.perPersonPerNight * (divers + nonDivers) * nights) + addOnCost;

        const validation = getPromoValidation(enteredCode, subtotal, divers);

        if (validation.valid) {
            state.appliedPromoCode = enteredCode;
            state.promoStatus = validation.message;
        } else {
            state.appliedPromoCode = null;
            state.promoStatus = enteredCode ? '\u274c Invalid Offer Code' : '';
        }

        updateQuote();
    };

    /* =========================================================
       Local Storage — Persistence
       ========================================================= */

    /**
     * Reads the current form state into a plain object for persistence.
     */
    const getBookingSnapshot = () => ({
        package: getSelectedRadioValue('divePackage', '3n6d'),
        accommodation: getSelectedRadioValue('accommodation', 'basic'),
        divers: calculatorForm.querySelector('#diver-count')?.value || '1',
        nonDivers: calculatorForm.querySelector('#non-diver-count')?.value || '0',
        mealPlan: calculatorForm.querySelector('#meal-plan')?.value || 'roomOnly',
        addons: getSelectedAddOns(),
        promoCode: state.appliedPromoCode || null,
        currency: calculatorForm.querySelector('#currency-select')?.value || CALCULATOR_CONFIG.currencySettings.defaultCurrency,
        arrivalDate: getDateValue('arrival-date'),
        departureDate: getDateValue('departure-date'),
        flightRequirements: calculatorForm.querySelector('#flight-requirements')?.value || ''
    });

    /**
     * Saves the current booking snapshot via BookingPersistence (if available).
     */
    const saveBookingSnapshot = () => {
        if (typeof window.BookingPersistence === 'undefined') {
            return;
        }
        try {
            window.BookingPersistence.save(getBookingSnapshot());
        } catch (e) {
            /* Non-fatal */
        }
    };

    /**
     * Applies a restored booking object back to the form and updates the summary.
     */
    const restoreBookingSnapshot = (booking) => {
        try {
            /* Package */
            if (booking.package) {
                const radio = calculatorForm.querySelector(`input[name="divePackage"][value="${booking.package}"]`);
                if (radio) radio.checked = true;
            }

            /* Accommodation */
            if (booking.accommodation) {
                const radio = calculatorForm.querySelector(`input[name="accommodation"][value="${booking.accommodation}"]`);
                if (radio) radio.checked = true;
            }

            /* Divers */
            const diverInput = calculatorForm.querySelector('#diver-count');
            if (diverInput && booking.divers !== undefined) {
                diverInput.value = booking.divers;
            }

            /* Non-Divers */
            const nonDiverInput = calculatorForm.querySelector('#non-diver-count');
            if (nonDiverInput && booking.nonDivers !== undefined) {
                nonDiverInput.value = booking.nonDivers;
            }

            /* Meal Plan */
            if (mealPlanSelect && booking.mealPlan) {
                mealPlanSelect.value = booking.mealPlan;
            }

            /* Add-ons (checkboxes) */
            calculatorForm.querySelectorAll('input[name="addons"]').forEach((cb) => {
                cb.checked = Array.isArray(booking.addons) && booking.addons.includes(cb.value);
            });

            /* Promo Code */
            if (booking.promoCode) {
                state.appliedPromoCode = booking.promoCode;
                if (promoInput) promoInput.value = booking.promoCode;
            }

            /* Currency */
            const currencySelect = calculatorForm.querySelector('#currency-select');
            if (currencySelect && booking.currency) {
                currencySelect.value = booking.currency;
            }

            /* Travel Dates */
            const arrivalInput = calculatorForm.querySelector('#arrival-date');
            if (arrivalInput && booking.arrivalDate) {
                arrivalInput.value = booking.arrivalDate;
            }

            const departureInput = calculatorForm.querySelector('#departure-date');
            if (departureInput && booking.departureDate) {
                departureInput.value = booking.departureDate;
            }

            /* Flight Requirements */
            const flightInput = calculatorForm.querySelector('#flight-requirements');
            if (flightInput && booking.flightRequirements) {
                flightInput.value = booking.flightRequirements;
            }

            /* Refresh summary immediately */
            updateQuote();
        } catch (e) {
            /* Restore failed — continue without interruption */
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[BookingRestore] restore failed:', e.message);
            }
        }
    };

    /* =========================================================
       Local Storage — Welcome Back Dialog
       ========================================================= */

    /**
     * Injects the dialog stylesheet once and returns when done.
     */
    const injectDialogStyles = () => {
        if (document.getElementById('booking-restore-dialog-styles')) {
            return;
        }
        const link = document.createElement('link');
        link.id = 'booking-restore-dialog-styles';
        link.rel = 'stylesheet';
        link.href = 'assets/styles/booking-restore-dialog.css';
        document.head.appendChild(link);
    };

    /**
     * Creates and shows an accessible "Welcome Back" dialog.
     *
     * @param {Function} onContinue   - Called when the user clicks "Continue Planning".
     * @param {Function} onStartAgain - Called when the user clicks "Start Again".
     */
    const showRestoreDialog = (onContinue, onStartAgain) => {
        injectDialogStyles();

        const overlay = document.createElement('div');
        overlay.className = 'booking-restore-overlay';
        overlay.setAttribute('role', 'presentation');

        const dialog = document.createElement('div');
        dialog.className = 'booking-restore-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'restore-dialog-title');
        dialog.setAttribute('aria-describedby', 'restore-dialog-desc');
        dialog.setAttribute('tabindex', '-1');

        dialog.innerHTML = `
            <div class="booking-restore-icon" aria-hidden="true">\uD83E\uDD3F</div>
            <h2 id="restore-dialog-title" class="booking-restore-title">Welcome Back!</h2>
            <p id="restore-dialog-desc" class="booking-restore-message">
                We found your saved dive holiday.<br>
                Would you like to continue planning or start a new holiday?
            </p>
            <div class="booking-restore-actions">
                <button type="button" class="booking-restore-btn-continue" id="restore-continue-btn">
                    Continue Planning
                </button>
                <button type="button" class="booking-restore-btn-start-again" id="restore-start-again-btn">
                    Start Again
                </button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => dialog.focus());

        const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const trapFocus = (event) => {
            const focusable = Array.from(dialog.querySelectorAll(focusableSelectors));
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                closeDialog();
                onStartAgain();
            }
        };

        const closeDialog = () => {
            document.removeEventListener('keydown', trapFocus);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        };

        document.addEventListener('keydown', trapFocus);

        dialog.querySelector('#restore-continue-btn').addEventListener('click', () => {
            closeDialog();
            onContinue();
        });

        dialog.querySelector('#restore-start-again-btn').addEventListener('click', () => {
            closeDialog();
            onStartAgain();
        });
    };

    /* =========================================================
       Local Storage — Initialisation
       ========================================================= */

    const initPersistence = () => {
        if (typeof window.BookingPersistence === 'undefined') {
            return;
        }

        const savedBooking = window.BookingPersistence.load();

        if (!savedBooking) {
            return;
        }

        showRestoreDialog(
            /* onContinue */
            () => {
                restoreBookingSnapshot(savedBooking);
            },
            /* onStartAgain */
            () => {
                window.BookingPersistence.clear();
                updateQuote();
            }
        );
    };

    /* =========================================================
       Event Listeners
       ========================================================= */

    calculatorForm.addEventListener('input', updateQuote);
    calculatorForm.addEventListener('change', updateQuote);

    calculatorForm.addEventListener('click', (event) => {
        const counterButton = event.target.closest('[data-counter-target]');

        if (!counterButton) {
            return;
        }

        const targetId = counterButton.getAttribute('data-counter-target');
        const step = Number.parseInt(counterButton.getAttribute('data-counter-step') || '0', 10);

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

    /* =========================================================
       Initialise
       ========================================================= */

    renderMealPlanOptions();
    renderAddOnOptions();
    populateStaticOptionPrices();
    updateQuote();
    initPersistence();
});
