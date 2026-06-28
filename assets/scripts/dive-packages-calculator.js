document.addEventListener('DOMContentLoaded', () => {
    const calculatorForm = document.getElementById('booking-calculator');

    if (!calculatorForm) {
        return;
    }

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

    const calculateAddOnsCost = (selectedAddOns, divers, nonDivers) => {
        const totalGuests = divers + nonDivers;

        return selectedAddOns.reduce((total, addOnKey) => {
            const addOn = PRICING_CONFIG.addOns[addOnKey];

            if (!addOn) {
                return total;
            }

            if (addOn.pricingModel === 'per_person_trip') {
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
