# StayWave Maldives — Implementation Plan

## 1) Purpose

This implementation roadmap translates the product vision in `docs/PROJECT_VISION.md` into a scalable delivery plan for a **premium dive travel planning platform** (not a booking site).

The experience should consistently guide users through:

**Discover Fuvahmulah → Explore Dive Packages → Start Planning → Build Your Dive Holiday → Review Holiday → Request My Personalised Quote**

---

## 2) Current Repository Snapshot (as reviewed)

### Existing pages
- `index.html`
- `about.html`
- `accommodation.html`
- `dive-packages.html`
- `dive-sites.html`
- `marine-life.html`

### Existing assets
- CSS is in `assets/styles/` with many page/section files (e.g. `global.css`, `navigation.css`, `hero.css`, `footer.css`, page-specific CSS).
- JavaScript is in `assets/scripts/` with modular-by-feature files (e.g. `navigation.js`, `faq.js`, `lazy-loading.js`, `dive-packages-calculator.js`).
- Media in `assets/images/` and `assets/videos/`.

### Architecture summary
- Static multi-page HTML architecture.
- Shared UI patterns are present but repeated across pages (header/footer/hero conventions).
- CSS is partly componentized but primarily page-scoped.
- JavaScript has useful separation by feature, with one very large calculator script.

---

## 3) Delivery Principles

1. **Planning-first UX:** Every feature should support inspiration, education, customization, and quotation readiness.
2. **Content-led conversion:** Replace booking-first language with planning-first language and clear guidance.
3. **Consistency before complexity:** Standardize components/tokens/layout patterns before adding new functionality.
4. **Accessibility + performance by default:** Semantic HTML, keyboard support, reduced motion support, optimized assets.
5. **Progressive enhancement:** Core journey must work without JavaScript where practical.

---

## 4) Phased Roadmap

## Phase 0 — Foundation Stabilization (Short)
**Goal:** Prepare the codebase for faster, safer iteration.

### Scope
- Baseline audit of all templates for repeated sections (header, footer, CTA blocks, metadata patterns).
- Define canonical page-level SEO metadata template and social metadata pattern.
- Document content rules for planning-oriented copy and CTA language.
- Create a reusable content structure standard for information pages.

### Deliverables
- Shared implementation standards doc(s).
- Metadata checklist.
- Accessibility checklist (headings, landmark roles, alt strategy, focus states).

### Success criteria
- All future pages can follow one documented template.
- Team has explicit “planning-platform” language guidance.

---

## Phase 1 — Core Journey Alignment (Short-Medium)
**Goal:** Align all key pages with the core user journey and premium planning narrative.

### Scope
- Ensure each main page clearly maps to a journey stage.
- Standardize CTA pathways:
  - “Start Planning”
  - “Build Your Dive Holiday”
  - “Request My Personalised Quote”
- Ensure internal links reduce dead ends and support forward movement.

### Deliverables
- Journey mapping matrix (page → stage → CTA → next step).
- Updated navigational/content flow plan.

### Success criteria
- Users can move through all journey stages without ambiguity.
- Every page has a clear next action toward planning.

---

## Phase 2 — Reusable Design System Consolidation (Medium)
**Goal:** Convert repeated styles/patterns into a maintainable design system.

### Scope
- Introduce design tokens and utility conventions (colors, spacing, radii, shadows, typography scale).
- Split CSS into predictable layers (see architecture section below).
- Consolidate duplicated hero, breadcrumb, CTA, and card styles.

### Deliverables
- Shared token file(s).
- Component CSS files for common sections.
- Naming convention guidance (BEM-style or equivalent).

### Success criteria
- New page creation requires minimal new CSS.
- Fewer style regressions due to standardized components.

---

## Phase 3 — Planning Experience Module (Medium)
**Goal:** Build/expand “Build Your Dive Holiday” as a robust pre-quote planner.

### Scope
- Structure planner inputs around diver intent:
  - travel dates/flexibility
  - diver level and goals
  - accommodation preferences
  - package depth/intensity
  - add-ons/preferences
- Add “Review Holiday” summary step before quote request.
- Add data validation and clear, human-readable summary outputs.

### Deliverables
- Planner flow specification.
- Modular JS implementation plan (state, validation, summary rendering).
- Content model for quote-ready payload.

### Success criteria
- Users can complete planning confidently without booking flow complexity.
- Quote requests arrive with high-quality contextual preferences.

---

## Phase 4 — Content Depth & Trust Layer (Medium)
**Goal:** Increase user confidence via educational and trust-building content.

### Scope
- Expand evergreen information architecture:
  - destination guidance
  - marine life seasonality/context
  - dive conditions and preparedness
  - policy and expectation clarity
- Strengthen FAQ structure by category and planning stage.
- Add transparent “what happens after quote request” guidance.

### Deliverables
- Content taxonomy for informational pages.
- FAQ categorization model.
- Trust/expectation communication blocks.

### Success criteria
- Lower pre-sales friction through better self-service information.
- Better-qualified quote requests and fewer repetitive support questions.

---

## Phase 5 — Performance, SEO, Accessibility Hardening (Ongoing)
**Goal:** Sustain premium quality at scale.

### Scope
- Performance budgets (images, scripts, CLS/LCP targets).
- Structured data strategy (Organization, FAQ, Breadcrumb, Product/Service as appropriate).
- Ongoing accessibility QA (keyboard flow, ARIA correctness, contrast, focus-visible).

### Deliverables
- QA checklists and acceptance gates.
- Lighthouse/perf baseline tracking doc.

### Success criteria
- Stable quality metrics as content/features grow.
- Accessibility and SEO become release requirements, not afterthoughts.

---

## 5) Recommended Reusable Components

Create and standardize the following reusable component patterns across all pages:

1. **Site Header / Primary Navigation**
2. **Hero Block** (title, supporting intro, optional media)
3. **Breadcrumbs**
4. **Section Intro** (eyebrow, heading, lead paragraph)
5. **Content Card Grid**
6. **Info/Policy Content Sections** (H2/H3 text blocks with consistent spacing)
7. **CTA Banner** (planning-first CTA variants)
8. **FAQ Accordion** (accessible toggles)
9. **Trust Indicators / Highlights**
10. **Site Footer** (single source structure and links)

Each component should define:
- semantic HTML contract,
- class naming contract,
- accessibility expectations,
- responsive behavior.

---

## 6) Recommended Folder Structure

Target structure (incremental migration, not a big-bang rewrite):

```text
/
├─ index.html
├─ about.html
├─ dive-packages.html
├─ ...other pages
├─ docs/
│  ├─ PROJECT_VISION.md
│  ├─ IMPLEMENTATION_PLAN.md
│  ├─ content-guidelines.md
│  ├─ accessibility-checklist.md
│  └─ seo-checklist.md
└─ assets/
   ├─ images/
   ├─ videos/
   ├─ styles/
   │  ├─ base/
   │  │  ├─ reset.css
   │  │  ├─ tokens.css
   │  │  ├─ typography.css
   │  │  └─ base.css
   │  ├─ layout/
   │  │  ├─ container.css
   │  │  ├─ grid.css
   │  │  └─ spacing.css
   │  ├─ components/
   │  │  ├─ navigation.css
   │  │  ├─ hero.css
   │  │  ├─ breadcrumbs.css
   │  │  ├─ cards.css
   │  │  ├─ cta.css
   │  │  ├─ faq.css
   │  │  └─ footer.css
   │  ├─ pages/
   │  │  ├─ home.css
   │  │  ├─ dive-packages.css
   │  │  └─ ...
   │  └─ main.css
   └─ scripts/
      ├─ core/
      │  ├─ dom.js
      │  ├─ a11y.js
      │  └─ analytics.js
      ├─ components/
      │  ├─ navigation.js
      │  ├─ faq.js
      │  ├─ lazy-loading.js
      │  └─ testimonials.js
      ├─ planner/
      │  ├─ state.js
      │  ├─ validation.js
      │  ├─ pricing.js
      │  ├─ summary.js
      │  └─ planner-controller.js
      └─ main.js
```

Notes:
- Keep current files during migration; move incrementally.
- Keep page-specific CSS/JS only for true page-unique logic.

---

## 7) Recommended JavaScript Architecture

### Approach
Use **modular, feature-based vanilla JS** with clear boundaries:

1. **Core utilities layer**
   - DOM helpers, event delegation, accessibility helpers.
2. **Component controllers**
   - Isolated scripts per component (nav, FAQ, lazy loading).
3. **Planner domain layer**
   - State management module.
   - Validation module.
   - Summary/serialization module.
4. **Bootstrap entrypoint**
   - `main.js` detects page context and initializes only needed modules.

### Conventions
- Prefer pure functions for calculations/transformations.
- Keep DOM writes centralized in render functions.
- Add defensive null checks before element bindings.
- Use `data-*` attributes for targeting over brittle selectors.
- Avoid one large “god file”; split calculator logic into planner modules.

### Scalability benefits
- Easier testing and debugging.
- Less coupling between pages.
- Faster onboarding for contributors.

---

## 8) Recommended CSS Architecture

### Method
Adopt layered CSS architecture:

1. **Base:** reset, tokens, global element defaults.
2. **Layout:** containers, grid, spacing primitives.
3. **Components:** reusable UI blocks (hero, cards, CTA, footer, FAQ).
4. **Pages:** minimal per-page overrides only.

### Conventions
- Tokenize colors, spacing, font sizes, shadows, radii, z-index.
- Use consistent naming convention (BEM-style recommended).
- Reduce selector depth and avoid ID-based styling.
- Keep media query breakpoints centralized and documented.
- Prefer mobile-first styles.

### Scalability benefits
- Predictable cascade.
- Lower risk of regressions.
- Faster creation of new information pages and journey pages.

---

## 9) Future Scalability Recommendations

1. **Content scalability**
   - Establish a reusable “information page template” standard.
   - Keep policy/FAQ copy in structured source files if content volume grows.

2. **Feature scalability**
   - Keep planning flow modular so new planner steps can be added without rewrites.
   - Isolate quote request payload formatting from UI rendering.

3. **Team/process scalability**
   - Add PR checklists for accessibility, SEO, and journey alignment.
   - Enforce “no unrelated changes” discipline per sprint.

4. **Technical scalability**
   - Consider build tooling only when needed (PostCSS/minification/bundling), while preserving static-site simplicity.
   - Introduce automated checks incrementally (HTML validation, linting, Lighthouse CI).

5. **Product scalability**
   - Instrument journey drop-off points with privacy-conscious analytics.
   - Iterate content and CTA placement based on observed user behavior.

---

## 10) Suggested Milestone Sequence

- **Milestone A:** Foundation standards + journey map
- **Milestone B:** Component/system consolidation
- **Milestone C:** Planner + review flow hardening
- **Milestone D:** Trust content depth + FAQ maturity
- **Milestone E:** Continuous quality/performance/accessibility governance

---

## 11) Definition of Done (Roadmap Governance)

A roadmap phase is complete when:
- Deliverables listed for that phase are documented and implemented.
- Core journey continuity is preserved.
- Accessibility and SEO checks pass.
- No booking functionality is introduced where planning-first behavior is required.
- Changes remain scoped and traceable to vision outcomes.
