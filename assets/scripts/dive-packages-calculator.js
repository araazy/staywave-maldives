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
            '3n6d': { name: '3 Nights • 6 Dives', nights: 3, dives: 6 },
            '5n9d': { name: '5 Nights • 9 Dives', nights: 5, dives: 9 },
            '7n15d': { name: '7 Nights • 15 Dives', nights: 7, dives: 15 }
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

    const PRICING_CONFIG = {
        currency: 'USD',
        whatsappNumber: '9607972103',
        occupancyPerRoom: 2,
        packages: {
            '3n6d': { name: '3 Nights • 6 Dives', nights: 3, dives: 6, basePerDiver: 780 },
            '5n9d': { name: '5 Nights • 9 Dives', nights: 5, dives: 9, basePerDiver: 1180 },
            '7n15d': { name: '7 Nights • 15 Dives', nights: 7, dives: 15, basePerDiver: 1790 }
        },
        accommodations: {
            basic: { name: 'Basic Homestay', nightlyPerRoom: 75 },
            standard: { name: 'Standard Guesthouse', nightlyPerRoom: 115 },
            premium: { name: 'Premium Stay', nightlyPerRoom: 165 },
            deluxe: { name: 'Deluxe Pool Stay', nightlyPerRoom: 225 }
        },
        mealPlans: {
            roomOnly: { name: 'Room Only', perPersonPerNight: 0 },
            bb: { name: 'Breakfast (BB)', perPersonPerNight: 15 },
            hb: { name: 'Half Board (HB)', perPersonPerNight: 35 },
            fb: { name: 'Full Board (FB)', perPersonPerNight: 58 }
        },
        nonDiver: {
            perPersonPerNight: 45
        },
        groupPricingTiers: [
            { minDivers: 1, label: '1 diver', multiplier: 1 },
            { minDivers: 2, label: '2 divers', multiplier: 0.97 },
            { minDivers: 4, label: '4 divers', multiplier: 0.93 },
            { minDivers: 6, label: '6 divers', multiplier: 0.89 },
            { minDivers: 8, label: '8 divers', multiplier: 0.85 },
            { minDivers: 10, label: '10+ divers', multiplier: 0.8 }
        ],
        addOns: {
            domesticFlight: { name: 'Domestic Return Flight', pricingModel: 'per_person_trip', price: 295 },
            equipmentRental: { name: 'Full Dive Equipment', pricingModel: 'per_diver_trip', price: 140 },
            nitrox: { name: 'Nitrox Upgrade', pricingModel: 'per_diver_trip', price: 85 },
            islandTour: { name: 'Island Discovery Tour', pricingModel: 'per_person_trip', price: 60 }
        }
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
        diveCost: document.getElementById('summary-dive-cost'),
        accommodationCost: document.getElementById('summary-accommodation-cost'),
        mealCost: document.getElementById('summary-meal-cost'),
        nonDiverCost: document.getElementById('summary-non-diver-cost'),
        addons: document.getElementById('summary-addons'),
        addonCost: document.getElementById('summary-addon-cost'),
        tier: document.getElementById('summary-tier'),
        savings: document.getElementById('summary-savings'),
        finalTotal: document.getElementById('summary-final-total'),
        quoteTotal: document.getElementById('quote-total'),
        screenReaderSummary: document.getElementById('screenreader-summary')
    };

    const whatsappLinks = [
        document.getElementById('whatsapp-enquiry-link'),
        document.getElementById('mobile-whatsapp-enquiry-link'),
        document.getElementById('floating-whatsapp-enquiry-link')
    ].filter(Boolean);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: PRICING_CONFIG.currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getSelectedRadioValue = (name) => {
        const selected = calculatorForm.querySelector(`input[name="${name}"]:checked`);
        return selected ? selected.value : null;
    };

    const parseIntWithBounds = (value, fallback, min = 0, max = Number.POSITIVE_INFINITY) => {
        const parsed = Number.parseInt(value, 10);

        if (Number.isNaN(parsed)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, parsed));
    };

    const getTierForDivers = (divers) => {
        let matchedTier = PRICING_CONFIG.groupPricingTiers[0];

        PRICING_CONFIG.groupPricingTiers.forEach((tier) => {
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

        return `${arrival.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → ${departure.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
    const calculateAddOnsCost = (selectedAddOns, divers, nonDivers) => {
        const totalGuests = divers + nonDivers;

        return selectedAddOns.reduce((total, addOnKey) => {
            const addOn = PRICING_CONFIG.addOns[addOnKey];

            if (!addOn) {
                return total;
            }

            if (addOn.pricingModel === 'per_person_trip') {
                return total + (addOn.price * nonDivers);
            }

            if (addOn.pricingModel === 'flat_trip') {
                return total + addOn.price;
            }

            return total;
        }, 0);
    };

    const getPromoValidation = (promoCode, subtotal, divers) => {
        if (!promoCode) {
            return { valid: false, message: '' };
        }

        const promo = CALCULATOR_CONFIG.promoCodes[promoCode];

        if (!promo) {
            return { valid: false, message: '❌ Invalid Offer Code' };
        }

        const currentDate = new Date();
        const expiryDate = new Date(`${promo.expiresOn}T23:59:59`);

        if (expiryDate < currentDate) {
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
        mealPlanSelect.innerHTML = '';

        Object.entries(CALCULATOR_CONFIG.mealPlans).forEach(([key, plan]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${plan.name} (${formatCurrency(plan.perPersonPerNight, CALCULATOR_CONFIG.defaults.currency)} / person / night)`;
            mealPlanSelect.appendChild(option);
        });
    };

    const renderAddOnOptions = () => {
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

        summaryElements.package.textContent = `${selectedPackage.name} (${selectedPackage.dives} dives)`;
        summaryElements.accommodation.textContent = selectedAccommodation.name;
        summaryElements.divers.textContent = String(divers);
        summaryElements.nonDivers.textContent = String(nonDivers);
        summaryElements.travelDates.textContent = formatDateRange(arrivalDate, departureDate);
        summaryElements.currencyLabel.textContent = selectedCurrency;
        summaryElements.mealPlan.textContent = selectedMealPlan.name;
        summaryElements.addons.textContent = addOnLabels.length ? addOnLabels.join(', ') : 'None';
        summaryElements.packagePrice.textContent = formatCurrency(packageCost, selectedCurrency);
        summaryElements.accommodationCost.textContent = formatCurrency(accommodationCost, selectedCurrency);
        summaryElements.accommodationUpgradeCost.textContent = formatCurrency(accommodationUpgradeCost, selectedCurrency);
        summaryElements.nonDiverCost.textContent = formatCurrency(nonDiverCost, selectedCurrency);
        summaryElements.addonCost.textContent = formatCurrency(addOnCost, selectedCurrency);
        summaryElements.groupDiscount.textContent = formatCurrency(groupDiscount, selectedCurrency);
        summaryElements.promoDiscount.textContent = formatCurrency(promoDiscount, selectedCurrency);
        summaryElements.tax.textContent = formatCurrency(taxAmount, selectedCurrency);
        summaryElements.serviceCharge.textContent = formatCurrency(serviceChargeAmount, selectedCurrency);
        summaryElements.deposit.textContent = formatCurrency(depositRequired, selectedCurrency);
        summaryElements.balance.textContent = formatCurrency(remainingBalance, selectedCurrency);
        summaryElements.totalSavings.textContent = formatCurrency(totalSavings, selectedCurrency);
        summaryElements.finalTotal.textContent = formatCurrency(finalTotal, selectedCurrency);
        summaryElements.quoteTotal.textContent = formatCurrency(finalTotal, selectedCurrency);
        summaryElements.currency.textContent = selectedCurrency;
        summaryElements.groupTier.textContent = tier.label;
        summaryElements.nights.textContent = String(nights);
        summaryElements.screenReaderSummary.textContent = `Updated estimate ${formatCurrency(finalTotal, selectedCurrency)} for ${divers} divers and ${nonDivers} non-divers.`;

        promoStatusElement.textContent = state.promoStatus;

        const flightRequirements = calculatorForm.querySelector('#flight-requirements')?.value?.trim() || 'Not specified';
                return total + (addOn.price * totalGuests);
            }

            if (addOn.pricingModel === 'per_diver_trip') {
                return total + (addOn.price * divers);
            }

            return total + addOn.price;
        }, 0);
    };

    const updateQuote = () => {
        const packageKey = getSelectedRadioValue('divePackage') || '3n6d';
        const accommodationKey = getSelectedRadioValue('accommodation') || 'basic';
        const mealPlanKey = calculatorForm.querySelector('#meal-plan')?.value || 'roomOnly';
        const divers = parseIntWithBounds(calculatorForm.querySelector('#diver-count')?.value, 2, 1, 20);
        const nonDivers = parseIntWithBounds(calculatorForm.querySelector('#non-diver-count')?.value, 0, 0, 20);
        const selectedAddOns = Array.from(calculatorForm.querySelectorAll('input[name="addons"]:checked')).map((input) => input.value);

        const selectedPackage = PRICING_CONFIG.packages[packageKey];
        const selectedAccommodation = PRICING_CONFIG.accommodations[accommodationKey];
        const selectedMealPlan = PRICING_CONFIG.mealPlans[mealPlanKey] || PRICING_CONFIG.mealPlans.roomOnly;
        const tier = getTierForDivers(divers);

        const totalGuests = divers + nonDivers;
        const roomCount = Math.max(1, Math.ceil(totalGuests / PRICING_CONFIG.occupancyPerRoom));

        const baseDiveCost = divers * selectedPackage.basePerDiver;
        const discountedDiveCost = Math.round(baseDiveCost * tier.multiplier);
        const savings = Math.max(0, baseDiveCost - discountedDiveCost);
        const accommodationCost = roomCount * selectedPackage.nights * selectedAccommodation.nightlyPerRoom;
        const mealCost = totalGuests * selectedPackage.nights * selectedMealPlan.perPersonPerNight;
        const nonDiverCost = nonDivers * selectedPackage.nights * PRICING_CONFIG.nonDiver.perPersonPerNight;
        const addOnsCost = calculateAddOnsCost(selectedAddOns, divers, nonDivers);

        const estimatedTotal = discountedDiveCost + accommodationCost + mealCost + nonDiverCost + addOnsCost;

        const selectedAddOnLabels = selectedAddOns.length > 0
            ? selectedAddOns.map((addOnKey) => PRICING_CONFIG.addOns[addOnKey].name).join(', ')
            : 'None';

        summaryElements.package.textContent = `${selectedPackage.name} (${selectedPackage.dives} dives)`;
        summaryElements.accommodation.textContent = `${selectedAccommodation.name} • ${selectedMealPlan.name}`;
        summaryElements.divers.textContent = String(divers);
        summaryElements.nonDivers.textContent = String(nonDivers);
        summaryElements.diveCost.textContent = formatCurrency(discountedDiveCost);
        summaryElements.accommodationCost.textContent = formatCurrency(accommodationCost);
        summaryElements.mealCost.textContent = formatCurrency(mealCost);
        summaryElements.nonDiverCost.textContent = formatCurrency(nonDiverCost);
        summaryElements.addons.textContent = selectedAddOnLabels;
        summaryElements.addonCost.textContent = formatCurrency(addOnsCost);
        summaryElements.tier.textContent = tier.label;
        summaryElements.savings.textContent = formatCurrency(savings);
        summaryElements.finalTotal.textContent = formatCurrency(estimatedTotal);
        summaryElements.quoteTotal.textContent = formatCurrency(estimatedTotal);
        summaryElements.screenReaderSummary.textContent = `Updated estimate ${formatCurrency(estimatedTotal)} with ${divers} divers and ${nonDivers} non-divers.`;

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
    };

    const applyPromoCode = () => {
        const enteredCode = (promoInput.value || '').trim().toUpperCase();
        state.appliedPromoCode = enteredCode || null;
        state.promoStatus = enteredCode ? '❌ Invalid Offer Code' : '';
        updateQuote();

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
            state.promoStatus = enteredCode ? '❌ Invalid Offer Code' : '';
        }

        updateQuote();
    };

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

    renderMealPlanOptions();
    renderAddOnOptions();
    populateStaticOptionPrices();
            `Meal Plan: ${selectedMealPlan.name}`,
            `Divers: ${divers}`,
            `Non-Divers: ${nonDivers}`,
            `Group Tier: ${tier.label}`,
            `Add-ons: ${selectedAddOnLabels}`,
            `Group Savings: ${formatCurrency(savings)}`,
            `Estimated Total: ${formatCurrency(estimatedTotal)}`
        ].join('\n');

        const whatsappHref = `https://wa.me/${PRICING_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        whatsappLinks.forEach((link) => {
            link.href = whatsappHref;
        });
    };

    calculatorForm.addEventListener('input', updateQuote);
    calculatorForm.addEventListener('change', updateQuote);

    updateQuote();
});
