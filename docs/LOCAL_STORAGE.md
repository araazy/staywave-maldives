# Local Storage Persistence — StayWave Maldives Booking

This document describes how the booking state is persisted to the browser's
`localStorage` so that guests can leave the site and return later to continue
planning their dive holiday.

---

## Data Structure

One key is stored in `localStorage`:

| Key | Value |
|---|---|
| `staywave_booking` | JSON-encoded envelope (see below) |

### Envelope shape

```json
{
  "version": "1.0",
  "savedAt": "2026-07-01T09:00:00.000Z",
  "booking": {
    "package":            "5n9d",
    "accommodation":      "premium",
    "divers":             "2",
    "nonDivers":          "1",
    "mealPlan":           "halfBoard",
    "addons":             ["domesticFlight", "islandTour"],
    "promoCode":          "EARLYBIRD",
    "currency":           "USD",
    "arrivalDate":        "2026-09-15",
    "departureDate":      "2026-09-20",
    "flightRequirements": "Window seat preferred"
  }
}
```

#### Field reference

| Field | Type | Description |
|---|---|---|
| `version` | string | Schema version string. Currently `"1.0"`. |
| `savedAt` | ISO 8601 string | UTC timestamp of when the snapshot was last saved. |
| `booking.package` | string | Dive package key (`3n6d` / `5n9d` / `7n15d`). |
| `booking.accommodation` | string | Accommodation key (`basic` / `standard` / `premium` / `deluxe`). |
| `booking.divers` | string | Number of divers (string representation of the input value). |
| `booking.nonDivers` | string | Number of non-diving guests. |
| `booking.mealPlan` | string | Meal plan key (`roomOnly` / `breakfast` / `halfBoard` / `fullBoard`). |
| `booking.addons` | string[] | Array of selected add-on keys. |
| `booking.promoCode` | string \| null | Applied promo code or `null`. |
| `booking.currency` | string | Selected display currency (`USD` / `EUR` / `GBP` / `MVR`). |
| `booking.arrivalDate` | string | Arrival date in `YYYY-MM-DD` format, or empty string. |
| `booking.departureDate` | string | Departure date in `YYYY-MM-DD` format, or empty string. |
| `booking.flightRequirements` | string | Free-text flight notes, or empty string. |

---

## Auto-Save Behaviour

The booking state is saved automatically after **every valid change** to the
booking calculator form.

- Triggered at the end of `updateQuote()` in
  `assets/scripts/dive-packages-calculator.js`.
- Calls `window.BookingPersistence.save(snapshot)` where `snapshot` is
  collected by `getBookingSnapshot()`.
- If `BookingPersistence` is not available (e.g. script load order issue),
  the save is skipped silently.

---

## Auto-Restore on Return Visit

When the booking calculator page loads:

1. `initPersistence()` is called after the form is initialised.
2. `BookingPersistence.load()` checks `localStorage` for a saved snapshot.
3. If a valid, non-expired snapshot is found, the **Welcome Back dialog** is
   displayed.

### Welcome Back dialog

| Element | Content |
|---|---|
| Title | `Welcome Back!` |
| Message | `We found your saved dive holiday. Would you like to continue planning or start a new holiday?` |
| Primary button | `Continue Planning` |
| Secondary button | `Start Again` |

**Continue Planning** — calls `restoreBookingSnapshot(booking)` which writes
all saved values back to the form and calls `updateQuote()` to refresh the
Holiday Summary immediately.

**Start Again** — calls `BookingPersistence.clear()` to remove the saved data
and calls `updateQuote()` to keep the summary consistent with the form defaults.

---

## Expiry Logic

Saved bookings **expire automatically after 30 days**.

- On every `load()` call, the `savedAt` timestamp is compared to the current
  time.
- If `Date.now() - savedAt > 30 days`, the stored item is deleted via
  `localStorage.removeItem(STORAGE_KEY)` and `null` is returned.
- No dialog is shown; the user continues without interruption.

The expiry constant lives in
`assets/scripts/booking/booking-persistence.js`:

```js
var EXPIRY_DAYS = 30;
var EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
```

To change the expiry period, update `EXPIRY_DAYS`.

---

## Versioning

The envelope stores a `version` field that is compared against the
`SCHEMA_VERSION` constant in `booking-persistence.js` (currently `"1.0"`).

### Compatibility rules

| Situation | Behaviour |
|---|---|
| `version === SCHEMA_VERSION` | Snapshot is accepted and used. |
| `version !== SCHEMA_VERSION` | Snapshot is silently discarded and deleted. No error, no dialog. |

### When to increment the version

Increment `SCHEMA_VERSION` in `booking-persistence.js` whenever:

- A required field is added to the `booking` object.
- An existing field is renamed, removed, or its allowed values change.
- The logic that interprets a field changes in a breaking way.

You do **not** need to increment for purely additive changes where missing
fields are handled gracefully (e.g. a new optional field with a safe fallback).

---

## Error Handling

All `localStorage` operations are wrapped in `try/catch` blocks.

- **Storage unavailable** (private browsing, quota exceeded, denied access):
  `isAvailable()` returns `false`; all operations are skipped silently.
- **Corrupt JSON**: `load()` catches the parse error, clears the key, and
  returns `null`.
- **Restore failure**: `restoreBookingSnapshot()` catches exceptions and logs
  a `console.warn` message; the form remains in its default state.

Users are **never** shown an error or interrupted if persistence fails.

---

## File Reference

| File | Purpose |
|---|---|
| `assets/scripts/booking/booking-persistence.js` | localStorage service (save / load / clear / expiry / versioning). Exposes `window.BookingPersistence`. |
| `assets/scripts/dive-packages-calculator.js` | Booking calculator. Calls persistence on every change; shows the restore dialog on load. |
| `assets/styles/booking-restore-dialog.css` | Accessible dialog styles injected dynamically by the calculator script. |

---

## How to Extend in Future Releases

### Add a new bookable field

1. Add the field to the `getBookingSnapshot()` function in
   `dive-packages-calculator.js` so it is captured on save.
2. Add restore logic for the new field inside `restoreBookingSnapshot()`.
3. If the change is breaking, increment `SCHEMA_VERSION` in
   `booking-persistence.js` (see [Versioning](#versioning) above).

### Change the expiry period

Edit `EXPIRY_DAYS` in `booking-persistence.js`. No other changes needed.

### Change the storage key

Edit `STORAGE_KEY` in `booking-persistence.js`. Existing saved bookings
under the old key will be abandoned (not deleted). If migrating users'
existing data is important, add a one-time migration step in `load()`.

### Move from localStorage to a backend / CMS

Replace the `save`, `load`, and `clear` implementations inside
`booking-persistence.js` with async API calls. The rest of the integration
in `dive-packages-calculator.js` does not need to change because it
calls `BookingPersistence.save()` / `load()` / `clear()` via the same
public API.

Because `initPersistence()` currently calls `load()` synchronously, switching
to async will also require making `initPersistence()` async and awaiting the
result before calling `showRestoreDialog()`.

### Support multiple saved bookings

The current design persists a single slot (`STORAGE_KEY`). To support multiple
slots (e.g. one per trip), change `STORAGE_KEY` to a per-trip identifier and
update the save/load/clear calls accordingly.

---

## Accessibility — Welcome Back Dialog

The dialog is built to meet WCAG 2.1 AA keyboard and screen-reader requirements:

| Requirement | Implementation |
|---|---|
| ARIA role | `role="dialog" aria-modal="true"` on the panel. |
| ARIA labelling | `aria-labelledby` → title element; `aria-describedby` → message element. |
| Focus management | `dialog.focus()` on open (via `requestAnimationFrame`). |
| Focus trapping | `keydown` listener traps Tab / Shift+Tab within the dialog. |
| ESC key | Closes the dialog and triggers **Start Again** behaviour. |
| No pointer-only dismiss | The overlay does not close on outside click to prevent accidental dismissal. |
