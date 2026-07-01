# Build Your Dive Holiday — UX Implementation Plan

## Purpose
Build Your Dive Holiday should become the primary conversion experience for StayWave Maldives: a premium planning journey that helps users compose a personalized dive holiday with confidence. It should feel guided, editorial, and aspirational — **not** like a dense booking form.

## Constraints
- This document is a design/implementation specification only.
- No production code changes are included.
- Existing marketing pages remain unchanged.

---

## 1) Desktop layout

### Overall shell
- **Top area:** calm hero band with title, short reassurance copy, and progress indicator.
- **Main content area:** two-column split.
  - **Left (primary):** Wizard step content cards (selection and configuration).
  - **Right (secondary):** Sticky Holiday Summary panel.
- **Bottom area:** persistent action bar with Back/Next and contextual validation hints.

### Grid recommendation
- Max width container: ~1200–1280px centered.
- Left column: ~65–70%.
- Right column: ~30–35%.
- Generous whitespace (premium feel), soft surface contrast, rounded cards.

### Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header/Nav                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Build Your Dive Holiday                  [Step x of y]  [Progress Bar─────]  │
│ “Craft your perfect Maldives dive escape”                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────┐  ┌──────���───────────────────────┐ │
│  │ LEFT: Wizard Step Content             │  │ RIGHT: Holiday Summary       │ │
│  │ - Step intro                          │  │ (sticky)                     │ │
│  │ - Reusable cards grid/list            │  │ - Placeholder totals         │ │
│  │ - Selected state + edit actions       │  │ - Selected items by category │ │
│  │ - Inline validation messages          │  │ - Promo/deposit placeholders │ │
│  └───────────────────────────────────────┘  └──────────────────────────────┘ │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Back]                                      validation copy         [Next]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Mobile layout

### Overall shell
- Single-column flow.
- Progress bar remains visible near top; compact step label.
- Wizard content occupies full width with stacked cards.
- Holiday Summary as **slide-up drawer** anchored to bottom with peek state.
- Navigation controls pinned/floating at bottom with safe-area awareness.

### Mobile wireframe

```text
┌──────────────────────────────┐
│ Header                       │
├──────────────────────────────┤
│ Build Your Dive Holiday      │
│ Step x/y   [Progress──────]  │
├──────────────────────────────┤
│ Step title                   │
│ Step helper text             │
│ ┌──────────────────────────┐ │
│ │ Reusable Card            │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Reusable Card            │ │
│ └──────────────────────────┘ │
│ ...                          │
├──────────────────────────────┤
│ Summary (peek)  ↑            │  <- tap/drag opens drawer
├──────────────────────────────┤
│ [Back]             [Next]    │
└──────────────────────────────┘

Expanded drawer:
┌──────────────────────────────┐
│ Summary                       │
│ Selected Package              │
│ Accommodation                 │
│ ...                           │
│ Pricing placeholders          │
│ [Close]                       │
└──────────────────────────────┘
```

---

## 3) Wizard flow

### Proposed steps (premium planning sequence)
1. **Choose Package**
   - Establish trip style and baseline inclusions.
2. **Choose Accommodation**
   - Room/villa experience and board basis.
3. **Add Transport**
   - Speedboat / domestic flight / seaplane pathways.
4. **Select Meals**
   - Meal plans and upgrades.
5. **Choose Equipment**
   - Bring-own vs rental bundles.
6. **Choose Experiences**
   - Specialty dives, excursions, add-ons.
7. **Review & Quote**
   - Consolidated summary and quote actions.

### Flow behavior
- Steps are linear with controlled branching only where needed.
- Users can move back without losing state.
- Next button disabled until required inputs are valid.
- Editable anchors from summary to jump back for revisions.

### Wizard step wireframe template

```text
Step Header
- Title
- “Why this matters” helper copy

Selection Zone
- Reusable cards (single or multi select)
- Optional detail fields in expandable subpanels

Validation Zone
- Inline message (if incomplete)

Footer Controls
[Back]                              [Next]
```

---

## 4) Reusable components

### Core card family (consistent skeleton)
All cards should share:
- Media area (image/icon)
- Title + short descriptor
- Feature bullets/tags
- Selection affordance (radio/checkbox/button)
- Optional expandable details
- Optional “Recommended” badge

### Card types
- **PackageCard**
- **AccommodationCard**
- **TransportCard**
- **MealCard**
- **EquipmentCard**
- **ExperienceCard**

### Supporting reusable UI
- StepHeader
- ProgressTracker
- ValidationMessage
- StickySummaryPanel
- SummarySection
- SummaryLineItem
- DrawerSummary (mobile)
- WizardNavBar
- SecondaryActions (edit/reset)
- QuoteActions (WhatsApp / Email / PDF)

### Reusable card wireframe

```text
┌──────────────────────────────────────────┐
│ [Media]                     [Recommended]│
│ Card Title                                 │
│ Brief premium descriptor                    │
│ • Feature A   • Feature B   • Feature C     │
│                         [Select / Selected] │
│ [Optional details toggle ▾]                │
└──────────────────────────────────────────┘
```

---

## 5) Holiday Summary panel

### Desktop (sticky sidebar)
- Always visible during wizard progression.
- Organized by categories in step order.
- Shows completion status per section.
- Displays pricing region with placeholders initially.
- Supports “Edit” deep links back to relevant step.

### Mobile (slide-up drawer)
- Collapsed peek state: concise summary + completion indicator.
- Expanded state: full category breakdown and placeholders.
- Non-blocking interaction (close/drag down).

### Content structure
1. Trip snapshot (dates/travelers placeholders)
2. Selected items by category
3. Pricing block (subtotal/discount/promo/deposit/balance placeholders)
4. Quote actions (final step emphasis)

### Summary wireframe

```text
Holiday Summary
────────────────
Package:         [Selected item]
Accommodation:   [Selected item]
Transport:       [Selected item]
Meals:           [Selected item]
Equipment:       [Selected item]
Experiences:     [n selected]
────────────────
Subtotal:        —
Discounts:       —
Promo Code:      —
Deposit:         —
Balance:         —
────────────────
[Edit section links]
```

---

## 6) Navigation flow

### Primary navigation rules
- **Next** advances only when current step is valid.
- **Back** always available except first step.
- Final step replaces Next with primary conversion CTAs.

### Secondary navigation
- Summary “Edit” links route to specific step and focus relevant control.
- Optional breadcrumb chips on desktop (non-linear revisit after initial completion).

### Validation behavior
- Inline messages near missing fields.
- Global helper in footer if blocked.
- First invalid control receives focus on Next attempt.

### Navigation state wireframe

```text
[Back]     “Please choose an accommodation to continue.”        [Next disabled]
```

---

## 7) Component hierarchy

```text
BuildYourDiveHolidayPage
├─ PlannerLayout
│  ├─ PlannerHeader
│  │  ├─ StepTitle
│  │  └─ ProgressTracker
│  ├─ PlannerBody
│  │  ├─ WizardStage
│  │  │  ├─ StepRenderer
│  │  │  │  ├─ PackageStep
│  │  │  │  │  └─ PackageCard[]
│  │  │  │  ├─ AccommodationStep
│  │  │  │  │  └─ AccommodationCard[]
│  │  │  │  ├─ TransportStep
│  │  │  │  │  └─ TransportCard[]
│  │  │  │  ├─ MealsStep
│  │  │  │  │  └─ MealCard[]
│  │  │  │  ├─ EquipmentStep
│  │  │  │  │  └─ EquipmentCard[]
│  │  │  │  ├─ ExperiencesStep
│  │  │  │  │  └─ ExperienceCard[]
│  │  │  │  └─ ReviewStep
│  │  │  └─ ValidationMessage
│  │  └─ SummaryColumn
│  │     └─ StickySummaryPanel (desktop)
│  ├─ MobileSummaryDrawer
│  └─ WizardNavBar
└─ QuoteActions (in review context)
```

---

## 8) JavaScript module structure

> File names are illustrative and should map to current repository conventions.

### Suggested modules
- `booking-page.js`
  - Bootstraps page, mounts layout, connects state/store.
- `wizard-controller.js`
  - Step registry, next/back logic, guards, progression.
- `validation-engine.js`
  - Step-level validation rules and error mapping.
- `summary-controller.js`
  - Derives summary view model from current selections.
- `cards/`
  - `base-card.js`
  - `package-card.js`
  - `accommodation-card.js`
  - `transport-card.js`
  - `meal-card.js`
  - `equipment-card.js`
  - `experience-card.js`
- `steps/`
  - One module per step renderer and field bindings.
- `state/booking-store.js`
  - Single source of truth for selections and pricing payload.
- `pricing/pricing-engine.js`
  - Calculation logic and applied adjustments.
- `pricing/promo-engine.js`
  - Promo validation and discount application.
- `timeline/timeline-engine.js`
  - Itinerary generation hooks.
- `experience/experience-score.js`
  - Adventure/Comfort/Photography/Relaxation/Value model.
- `quote/quote-generator.js`
  - WhatsApp/email/PDF payload assembly.

### Data flow
1. User action on card/field.
2. Store update.
3. Validation recompute for active step.
4. Summary recompute.
5. Pricing recompute (when pricing is active).
6. UI rerender affected fragments only.

---

## 9) CSS module structure

### Suggested stylesheets
- `booking-page.css`
  - Page shell, grid, responsive breakpoints.
- `wizard.css`
  - Step container, progress bar, nav controls.
- `cards.css`
  - Shared card anatomy and card variants.
- `summary.css`
  - Desktop sticky summary panel styles.
- `summary-drawer.css`
  - Mobile slide-up drawer states/transitions.
- `forms.css`
  - Inputs, toggles, inline validation.
- `utilities.css`
  - Spacing helpers, display utilities, accessibility helpers.

### Style principles for premium planner feel
- Soft elevation layers, subtle borders, non-harsh contrast.
- Spacious vertical rhythm.
- Refined typography hierarchy (editorial tone).
- Motion: gentle transitions for step changes/drawer interactions.
- Clear focus states and accessible color contrast.

---

## 10) Data model for pricing

> This model is proposed now for future implementation; initial UI can bind placeholders.

```ts
type BookingState = {
  meta: {
    currency: string;            // e.g., "USD"
    travelers: number;
    nights: number;
    startDate?: string;
    endDate?: string;
  };

  selections: {
    packageId?: string;
    accommodationId?: string;
    transportId?: string;
    mealPlanId?: string;
    equipmentIds: string[];
    experienceIds: string[];
  };

  pricingInputs: {
    packageBase?: number;
    accommodationPerNight?: number;
    transportCost?: number;
    mealPlanPerPersonPerNight?: number;
    equipmentTotal?: number;
    experiencesTotal?: number;
  };

  adjustments: {
    discounts: Array<{
      code?: string;
      label: string;
      type: "fixed" | "percent";
      value: number;
      amountApplied?: number;
    }>;
    promoCode?: {
      code: string;
      isValid: boolean;
      message?: string;
      amountApplied?: number;
    };
  };

  totals: {
    subtotal: number;
    discountTotal: number;
    grandTotal: number;
    depositDue: number;
    balanceDue: number;
  };
};
```

### Calculation order (future)
1. Build line items from selections + quantity factors.
2. Compute subtotal.
3. Apply stacked discounts/promo rules.
4. Compute grand total.
5. Compute deposit and balance split.

---

## Step-by-step wireframe descriptions

### Step 1 — Package
```text
Title: Choose your dive package
Body: 2–3 premium PackageCards, one required
Summary updates: Package section
```

### Step 2 — Accommodation
```text
Title: Pick your stay style
Body: AccommodationCards with room highlights and board basis tags
Summary updates: Accommodation section
```

### Step 3 — Transport
```text
Title: Select your transfer
Body: TransportCards (speedboat/domestic/seaplane) with duration badges
Summary updates: Transport section
```

### Step 4 — Meals
```text
Title: Plan your dining
Body: MealCards (BB/HB/FB/AI-style options)
Summary updates: Meals section
```

### Step 5 — Equipment
```text
Title: Equipment preferences
Body: EquipmentCards (bring own / rental kits / mixed)
Summary updates: Equipment section
```

### Step 6 — Experiences
```text
Title: Add signature experiences
Body: ExperienceCards in multi-select grid
Summary updates: Experiences count/list
```

### Step 7 — Review & Quote
```text
Title: Review your holiday plan
Body: Full summary with placeholders and quote action buttons
Primary CTA group: WhatsApp / Email / Download PDF
```

---

## UX quality checklist (pre-build)
- Feels like concierge planning, not transactional form fill.
- Step content remains visually focused and low-cognitive-load.
- Summary is always accessible (sticky or drawer).
- Validation is informative and non-punitive.
- Mobile interactions remain thumb-friendly and interrupt-free.
- Architecture supports phased rollout (UI first, logic later).

---

## Implementation sequencing recommendation
1. Page shell + responsive layout.
2. Wizard controller + progress + validation scaffolding.
3. Reusable card system.
4. Summary panel (desktop sticky + mobile drawer).
5. Review/quote action shell.
6. Pricing/timeline/experience score logic integration (later phases).
